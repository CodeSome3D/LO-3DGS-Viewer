export class XRManager {

    constructor(lo) {
        this.lo = lo;
        this.isGyroActive = false;
        this.gyroListener = null;
        this.motionListener = null;
        this.sensor = null;
        this.lastBeta = null;
        this.lastGamma = null;
        this.lastAlpha = null;
        this.receivedData = false;
        this.livenessTimer = null;
        this._cachedOrbitController = null; // Cached to avoid forceOrbit() on every sensor tick
    }

    isWebXRSupported() {
        return Boolean(navigator.xr && navigator.xr.isSessionSupported);
    }

    async toggleVR() {
        const app = this.lo.viewer?.global?.app;

        // 1. If WebXR immersive VR is genuinely available (e.g. Meta Quest, Vision Pro, VR headset)
        if (app?.xr && typeof app.xr.isAvailable === 'function' && app.xr.isAvailable('immersive-vr')) {
            if (app.xr.active) {
                app.xr.end();
                return;
            }
            const camera = app.root.findByName('camera')?.camera;
            if (camera) {
                try {
                    await app.xr.start(camera, 'immersive-vr', 'local-floor');
                    return;
                } catch (e) {
                    console.warn("[XRManager] WebXR VR start failed, falling back to gyroscope:", e);
                }
            }
        }

        // 2. On Mobile Devices (iOS / Android) or standard browser: Toggle Gyroscope Motion Controls
        await this.toggleGyroscope();
    }

    async toggleGyroscope() {
        if (this.isGyroActive) {
            this.disableGyroscope();
            this.updateButtonState(false);
            if (this.lo.uiManager?.showToast) {
                this.lo.uiManager.showToast("📱 Motion controls: OFF");
            }
            return;
        }

        // Check for Insecure Context on Android Chrome (HTTP over LAN IP)
        const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
        if (window.isSecureContext === false && !isLocalHost) {
            console.warn("[XRManager] Android Chrome blocks DeviceOrientation and Motion on insecure HTTP origins.");
        }

        // iOS 13+ permission request
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
            try {
                const response = await DeviceOrientationEvent.requestPermission();
                if (response === "granted") {
                    this.enableSensors();
                } else {
                    if (this.lo.uiManager?.showToast) {
                        this.lo.uiManager.showToast("⚠️ Motion sensor permission denied by browser");
                    }
                }
            } catch (err) {
                console.warn("[XRManager] Device orientation permission error:", err);
                this.enableSensors();
            }
        } else {
            // Android / Standard browsers
            this.enableSensors();
        }
    }

    enableSensors() {
        this.receivedData = false;
        this.lastBeta = null;
        this.lastGamma = null;
        this.lastAlpha = null;
        this._cachedOrbitController = null;

        // Try to cache the orbit controller immediately so we avoid calling
        // forceOrbit() (which changes camera-mode state) on every sensor tick.
        try {
            this._cachedOrbitController = this.lo.cameraManager?.getOrbitController();
        } catch (e) {
            // Will retry on first sensor reading
        }

        // 1. Orientation Listener (DeviceOrientation / DeviceOrientationAbsolute)
        this.gyroListener = (e) => {
            const beta = e.beta;   // -180 to 180 (tilt front-to-back)
            const gamma = e.gamma; // -90 to 90 (tilt left-to-right)
            const alpha = e.alpha; // 0 to 360 (compass direction)

            if (beta === null || gamma === null) return;
            this.receivedData = true;

            if (this.lastBeta === null || this.lastGamma === null) {
                this.lastBeta = beta;
                this.lastGamma = gamma;
                this.lastAlpha = alpha;
                return;
            }

            let deltaBeta = (beta - this.lastBeta);
            let deltaGamma = (gamma - this.lastGamma);

            // Filter out angle wrap-around anomalies
            if (Math.abs(deltaBeta) > 40) deltaBeta = 0;
            if (Math.abs(deltaGamma) > 40) deltaGamma = 0;

            this.lastBeta = beta;
            this.lastGamma = gamma;
            this.lastAlpha = alpha;

            this.applyRotationDelta(deltaBeta, deltaGamma);
        };

        // 2. DeviceMotion Fallback (using accelerationIncludingGravity or rotationRate)
        this.motionListener = (e) => {
            if (this.receivedData) return; // Prioritize direct orientation if available

            if (e.rotationRate && (e.rotationRate.alpha !== null || e.rotationRate.beta !== null)) {
                this.receivedData = true;
                const dt = (e.interval || 16) / 1000;
                const rotX = (e.rotationRate.beta || 0) * dt;
                const rotY = -(e.rotationRate.alpha || e.rotationRate.gamma || 0) * dt;
                this.applyRotationDelta(rotX * 2, rotY * 2);
            } else if (e.accelerationIncludingGravity) {
                const { x, y, z } = e.accelerationIncludingGravity;
                if (x !== null && y !== null && z !== null) {
                    this.receivedData = true;
                    const beta = Math.atan2(y, Math.hypot(x, z)) * (180 / Math.PI);
                    const gamma = Math.atan2(-x, Math.hypot(y, z)) * (180 / Math.PI);

                    if (this.lastBeta !== null && this.lastGamma !== null) {
                        let deltaBeta = beta - this.lastBeta;
                        let deltaGamma = gamma - this.lastGamma;
                        if (Math.abs(deltaBeta) < 30 && Math.abs(deltaGamma) < 30) {
                            this.applyRotationDelta(deltaBeta, deltaGamma);
                        }
                    }
                    this.lastBeta = beta;
                    this.lastGamma = gamma;
                }
            }
        };

        // 3. Generic Sensor API (RelativeOrientationSensor) if supported
        if (typeof RelativeOrientationSensor !== "undefined") {
            try {
                this.sensor = new RelativeOrientationSensor({ frequency: 60 });
                this.sensor.addEventListener("reading", () => {
                    this.receivedData = true;
                    // Quaternion reading
                    const [qx, qy, qz, qw] = this.sensor.quaternion;
                    // Convert quaternion pitch / yaw
                    const sinp = 2 * (qw * qx - qy * qz);
                    const beta = Math.abs(sinp) >= 1 ? Math.sign(sinp) * (Math.PI / 2) : Math.asin(sinp);
                    const siny_cosp = 2 * (qw * qz + qx * qy);
                    const cosy_cosp = 1 - 2 * (qy * qy + qz * qz);
                    const gamma = Math.atan2(siny_cosp, cosy_cosp);

                    const degBeta = beta * (180 / Math.PI);
                    const degGamma = gamma * (180 / Math.PI);

                    if (this.lastBeta !== null && this.lastGamma !== null) {
                        let dB = degBeta - this.lastBeta;
                        let dG = degGamma - this.lastGamma;
                        if (Math.abs(dB) < 30 && Math.abs(dG) < 30) {
                            this.applyRotationDelta(dB, dG);
                        }
                    }
                    this.lastBeta = degBeta;
                    this.lastGamma = degGamma;
                });
                this.sensor.start();
            } catch (err) {
                console.warn("[XRManager] Generic Sensor API unavailable:", err);
            }
        }

        window.addEventListener("deviceorientation", this.gyroListener, { passive: true });
        window.addEventListener("deviceorientationabsolute", this.gyroListener, { passive: true });
        window.addEventListener("devicemotion", this.motionListener, { passive: true });

        this.isGyroActive = true;
        this.updateButtonState(true);

        if (this.lo.uiManager?.showToast) {
            this.lo.uiManager.showToast("📱 Motion controls: ON (Tilt phone to look around)");
        }

        // Liveness check: after 2s, if no sensor data arrived, explain the likely cause.
        if (this.livenessTimer) clearTimeout(this.livenessTimer);
        this.livenessTimer = setTimeout(() => {
            if (this.isGyroActive && !this.receivedData) {
                const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
                let msg;
                if (window.isSecureContext === false && !isLocal) {
                    msg = "⚠️ Motion sensors require HTTPS. Open the viewer via https:// instead of http://.";
                } else {
                    // Likely a device permission issue (Xiaomi MIUI, etc.)
                    msg = "⚠️ No sensor data. On Xiaomi/MIUI: Settings → Privacy → Permission Manager → Motion sensors → enable for Chrome.";
                }
                if (this.lo.uiManager?.showToast) {
                    this.lo.uiManager.showToast(msg, 7000);
                }
            }
        }, 2000);
    }

    applyRotationDelta(deltaBeta, deltaGamma) {
        try {
            // Use cached controller to avoid calling forceOrbit() on every 60Hz tick.
            if (!this._cachedOrbitController) {
                this._cachedOrbitController = this.lo.cameraManager?.getOrbitController();
            }
            const controller = this._cachedOrbitController;
            if (controller && controller._targetRootPose) {
                const orientation = window.screen?.orientation?.angle ?? (window.orientation || 0);

                let rotX = 0;
                let rotY = 0;

                if (orientation === 90) {
                    rotY = -deltaBeta * 0.9;
                    rotX = -deltaGamma * 0.9;
                } else if (orientation === -90 || orientation === 270) {
                    rotY = deltaBeta * 0.9;
                    rotX = deltaGamma * 0.9;
                } else if (orientation === 180) {
                    rotY = deltaGamma * 0.9;
                    rotX = -deltaBeta * 0.9;
                } else {
                    // Standard Portrait
                    rotY = -deltaGamma * 0.9;
                    rotX = deltaBeta * 0.9;
                }

                controller._targetRootPose.angles.y += rotY;
                controller._targetRootPose.angles.x = Math.max(-89, Math.min(89, controller._targetRootPose.angles.x + rotX));

                // Synchronize rootPose immediately for high frame-rate responsiveness
                controller._rootPose.angles.y = controller._targetRootPose.angles.y;
                controller._rootPose.angles.x = controller._targetRootPose.angles.x;

                this.lo.viewer?.wake?.(3);
            }
        } catch (err) {
            // Reset cache so we retry on next tick
            this._cachedOrbitController = null;
        }
    }

    disableGyroscope() {
        if (this.livenessTimer) {
            clearTimeout(this.livenessTimer);
            this.livenessTimer = null;
        }
        if (this.gyroListener) {
            window.removeEventListener("deviceorientation", this.gyroListener);
            window.removeEventListener("deviceorientationabsolute", this.gyroListener);
            this.gyroListener = null;
        }
        if (this.motionListener) {
            window.removeEventListener("devicemotion", this.motionListener);
            this.motionListener = null;
        }
        if (this.sensor) {
            try { this.sensor.stop(); } catch (e) {}
            this.sensor = null;
        }
        this.isGyroActive = false;
        this.receivedData = false;
        this._cachedOrbitController = null;
        this.updateButtonState(false);
    }

    updateButtonState(active) {
        const btn = document.getElementById("lo-viewer-vr-btn");
        if (btn) {
            btn.classList.toggle("active", active);
            btn.style.background = active ? "rgba(34, 199, 184, 0.4)" : "";
            btn.style.borderColor = active ? "var(--lo-accent, #22C7B8)" : "";
            btn.style.boxShadow = active ? "0 0 16px rgba(34, 199, 184, 0.6)" : "";
        }
    }
}

