export class XRManager {

    constructor(lo) {
        this.lo = lo;
        this.isGyroActive = false;
        this.gyroListener = null;
        this.lastBeta = null;
        this.lastGamma = null;
        this.lastAlpha = null;
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

        // iOS 13+ permission request
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
            try {
                const response = await DeviceOrientationEvent.requestPermission();
                if (response === "granted") {
                    this.enableGyroscope();
                } else {
                    if (this.lo.uiManager?.showToast) {
                        this.lo.uiManager.showToast("⚠️ Motion sensor permission denied by browser");
                    }
                }
            } catch (err) {
                console.warn("[XRManager] Device orientation permission error:", err);
                if (this.lo.uiManager?.showToast) {
                    this.lo.uiManager.showToast("⚠️ Could not request motion permission");
                }
            }
        } else if (typeof window !== "undefined" && ("ondeviceorientation" in window || "DeviceOrientationEvent" in window)) {
            this.enableGyroscope();
        } else {
            if (this.lo.uiManager?.showToast) {
                this.lo.uiManager.showToast("⚠️ Device orientation not available on this hardware");
            }
        }
    }

    enableGyroscope() {
        this.lastBeta = null;
        this.lastGamma = null;
        this.lastAlpha = null;

        this.gyroListener = (e) => {
            const beta = e.beta;   // -180 to 180 (tilt front-to-back)
            const gamma = e.gamma; // -90 to 90 (tilt left-to-right)
            const alpha = e.alpha; // 0 to 360 (compass direction)

            if (beta === null || gamma === null) return;

            if (this.lastBeta === null || this.lastGamma === null) {
                this.lastBeta = beta;
                this.lastGamma = gamma;
                this.lastAlpha = alpha;
                return;
            }

            let deltaBeta = (beta - this.lastBeta);
            let deltaGamma = (gamma - this.lastGamma);

            // Handle wrap-around or rapid movement jumps
            if (Math.abs(deltaBeta) > 30) deltaBeta = 0;
            if (Math.abs(deltaGamma) > 30) deltaGamma = 0;

            this.lastBeta = beta;
            this.lastGamma = gamma;
            this.lastAlpha = alpha;

            try {
                const controller = this.lo.cameraManager?.getOrbitController();
                if (controller && controller._targetRootPose) {
                    // Check screen orientation (portrait vs landscape)
                    const orientation = window.screen?.orientation?.angle ?? (window.orientation || 0);

                    let rotX = 0;
                    let rotY = 0;

                    if (orientation === 90) {
                        rotY = -deltaBeta * 0.75;
                        rotX = -deltaGamma * 0.75;
                    } else if (orientation === -90 || orientation === 270) {
                        rotY = deltaBeta * 0.75;
                        rotX = deltaGamma * 0.75;
                    } else if (orientation === 180) {
                        rotY = deltaGamma * 0.75;
                        rotX = -deltaBeta * 0.75;
                    } else {
                        // Standard Portrait
                        rotY = -deltaGamma * 0.75;
                        rotX = deltaBeta * 0.75;
                    }

                    controller._targetRootPose.angles.y += rotY;
                    controller._targetRootPose.angles.x = Math.max(-89, Math.min(89, controller._targetRootPose.angles.x + rotX));

                    // Immediately synchronize rootPose so responsiveness is snappy and real-time
                    controller._rootPose.angles.y = controller._targetRootPose.angles.y;
                    controller._rootPose.angles.x = controller._targetRootPose.angles.x;

                    this.lo.viewer?.wake?.(3);
                }
            } catch (err) {
                // Ignore if controller is transitioning
            }
        };

        window.addEventListener("deviceorientation", this.gyroListener, { passive: true });
        window.addEventListener("deviceorientationabsolute", this.gyroListener, { passive: true });
        this.isGyroActive = true;
        this.updateButtonState(true);

        if (this.lo.uiManager?.showToast) {
            this.lo.uiManager.showToast("📱 Motion controls: ON (Tilt phone to look around)");
        }
    }

    disableGyroscope() {
        if (this.gyroListener) {
            window.removeEventListener("deviceorientation", this.gyroListener);
            window.removeEventListener("deviceorientationabsolute", this.gyroListener);
            this.gyroListener = null;
        }
        this.isGyroActive = false;
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
