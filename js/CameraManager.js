import { LOCamera } from "./LOCamera.js";

export class CameraManager {

    constructor(lo) {
        this.lo = lo;
    }

    capture() {

        this.forceOrbit();

        const controller = this.getOrbitController();
        const orbit = this.lo.getController();

        const root = controller._targetRootPose;
        const child = controller._targetChildPose;

        return new LOCamera({
            position: {
                x: root.position.x,
                y: root.position.y,
                z: root.position.z
            },
            angles: {
                x: root.angles.x,
                y: root.angles.y,
                z: root.angles.z
            },
            distance: child.position.z,
            fov: orbit.fov
        });
    }

    apply(camera, instant = false) {

        if (!camera) {
            return;
        }

        this.stopAutospin();
        this.forceOrbit();

        const controller = this.getOrbitController();
        const orbit = this.lo.getController();

        //Camera speed
        controller.rotateDamping = 0.9971;
        controller.moveDamping = 0.9971;
        controller.zoomDamping = 0.9971;

        controller._targetRootPose.position.set(
            camera.position.x,
            camera.position.y,
            camera.position.z
        );

        controller._targetRootPose.angles.set(
            camera.angles.x,
            camera.angles.y,
            camera.angles.z
        );

        controller._targetChildPose.position.z = camera.distance;

        orbit.fov = camera.fov;

        if (instant) {
            controller._rootPose.position.copy(controller._targetRootPose.position);
            controller._rootPose.angles.copy(controller._targetRootPose.angles);
            controller._childPose.position.copy(controller._targetChildPose.position);
            this.lo.viewer?.wake?.(4);
        } else {
            // wake for at least 120 frames for a smooth transition
            this.lo.viewer?.wake?.(120);
            
            // clear previous interval if any
            if (this._wakeInterval) clearInterval(this._wakeInterval);
            this._wakeInterval = setInterval(() => {
                this.lo.viewer?.wake?.(2);
                const dPos = controller._rootPose.position.distance(controller._targetRootPose.position);
                if (dPos < 0.001) {
                    clearInterval(this._wakeInterval);
                }
            }, 33);
        }
    }

    save(name) {

        this.lo.cameras[name] = this.capture();

        this.lo.uiManager?.showToast(
            `Camera "${name}" saved`
        );
    }

    goTo(name, instant = false) {

        this.apply(this.lo.cameras[name], instant);
    }

    updateSelected() {

        const hotspot = this.lo.selectedHotspot;

        if (!hotspot) {
            return;
        }

        this.lo.cameras[hotspot.cameraId] = this.capture();

        this.lo.uiManager?.showToast(
            "✓ Camera updated"
        );
    }

    list() {

        return Object.keys(this.lo.cameras);
    }

    flyTo(position, target, fov = 75) {

        this.apply({

            position: {
                x: target.x,
                y: target.y,
                z: target.z
            },

            angles: this.lookAt(position, target),

            distance: Math.hypot(

                position.x - target.x,
                position.y - target.y,
                position.z - target.z

            ),

            fov

        });
    }

    lookAt(position, target) {

        const dx = target.x - position.x;
        const dy = target.y - position.y;
        const dz = target.z - position.z;

        const horizontal = Math.hypot(dx, dz);

        return {

            x: Math.atan2(dy, horizontal) * 180 / Math.PI,

            y: Math.atan2(dx, dz) * 180 / Math.PI - 180,

            z: 0

        };
    }

    forceOrbit() {

        this.lo.viewer.global.state.cameraMode = "orbit";
    }

    frame(bbox = null, fov = null) {
        if (this.lo.viewer?.frame) {
            this.lo.viewer.frame(bbox, fov);
        }
    }

    setDamping(move, rotate = move, zoom = move) {

        const controller = this.getOrbitController();

        controller.moveDamping = move;
        controller.rotateDamping = rotate;
        controller.zoomDamping = zoom;
    }

    getOrbitController() {

        this.forceOrbit();

        const orbit = this.lo.getController();

        if (!orbit.controller) {
            throw new Error("Orbit controller is not active.");
        }

        return orbit.controller;
    }

    startAutospin(speed = 10) {
        this.stopAutospin();
        this._autospinActive = true;
        
        let lastTime = performance.now();
        const spinLoop = (time) => {
            if (!this._autospinActive) return;
            
            const dt = time - lastTime;
            lastTime = time;
            
            if (dt < 100) {
                try {
                    const controller = this.getOrbitController();
                    if (controller) {
                        controller._targetRootPose.angles.y += speed * (dt / 1000);
                        this.lo.viewer?.wake?.(2);
                    }
                } catch (e) {
                    // Ignore if orbit controller is not active yet
                }
            }
            
            this._autospinFrame = requestAnimationFrame(spinLoop);
        };
        this._autospinFrame = requestAnimationFrame(spinLoop);

        // Stop on interaction
        const stopOnInteract = () => {
            this.stopAutospin();
            window.removeEventListener('mousedown', stopOnInteract);
            window.removeEventListener('touchstart', stopOnInteract);
        };
        window.addEventListener('mousedown', stopOnInteract);
        window.addEventListener('touchstart', stopOnInteract);
    }

    stopAutospin() {
        this._autospinActive = false;
        if (this._autospinFrame) {
            cancelAnimationFrame(this._autospinFrame);
            this._autospinFrame = null;
        }
    }
}