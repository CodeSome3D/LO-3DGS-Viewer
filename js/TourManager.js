export class TourManager {

    constructor(lo) {
        this.lo = lo;
        this.currentHotspotIndex = -1;
        this.isPlaying = false;
        this.dwellTime = 5000;
        this.stepStartTime = 0;
        this.rafId = null;
        this._listenersAttached = false;
    }

    get tourHotspots() {
        return (this.lo.hotspots || []).filter(h => h.type !== "portal");
    }

    initListeners() {
        if (this._listenersAttached) return;
        this._listenersAttached = true;

        const onUserInteraction = () => {
            if (this.isPlaying) {
                this.pauseAutoplay(true);
            }
        };

        const canvas = this.lo.canvas || document.querySelector("canvas");
        if (canvas) {
            canvas.addEventListener("pointerdown", onUserInteraction, { passive: true });
            canvas.addEventListener("wheel", onUserInteraction, { passive: true });
            canvas.addEventListener("touchstart", onUserInteraction, { passive: true });
        }
    }

    start() {

        const list = this.tourHotspots;
        if (list.length === 0) {
            return;
        }

        this.currentHotspotIndex = 0;

        const hotspot =
            list[0];

        this.goTo(hotspot);
    }

    setCurrent(hotspotId) {

        const list = this.tourHotspots;
        const index =
            list.findIndex(
                hotspot =>
                    hotspot.id === hotspotId
            );

        if (index === -1) {
            return;
        }

        this.currentHotspotIndex = index;
    }

    next() {

        const list = this.tourHotspots;
        if (list.length === 0) {
            return;
        }

        this.currentHotspotIndex++;

        if (
            this.currentHotspotIndex >=
            list.length
        ) {
            this.currentHotspotIndex = 0;
        }

        const hotspot =
            list[
                this.currentHotspotIndex
            ];

        this.goTo(hotspot);
    }

    previous() {

        const list = this.tourHotspots;
        if (list.length === 0) {
            return;
        }

        this.currentHotspotIndex--;

        if (this.currentHotspotIndex < 0) {

            this.currentHotspotIndex =
                list.length - 1;
        }

        const hotspot =
            list[
                this.currentHotspotIndex
            ];

        this.goTo(hotspot);
    }

    goTo(hotspot) {

        this.lo.selectHotspot(
            hotspot.id
        );

        this.lo.cameraManager.goTo(
            hotspot.cameraId
        );

        this.lo.tourUIManager?.update(
            hotspot
        );

        this.stepStartTime = performance.now();
    }

    getDwellTime() {
        return this.lo.projectcard?.tourDwellTime || this.dwellTime || 5000;
    }

    toggleAutoplay() {
        if (this.isPlaying) {
            this.pauseAutoplay();
        } else {
            this.startAutoplay();
        }
    }

    startAutoplay() {
        this.initListeners();
        const list = this.tourHotspots;
        if (list.length === 0) {
            this.lo.uiManager?.showToast?.("No hotspots in this scene to tour.");
            return;
        }

        this.isPlaying = true;
        this.lo.tourUIManager?.setPlayState(true);

        if (this.currentHotspotIndex === -1) {
            this.start();
        } else {
            this.stepStartTime = performance.now();
        }

        this._runTick();
    }

    pauseAutoplay(userTriggered = false) {
        this.isPlaying = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.lo.tourUIManager?.setPlayState(false);
        if (userTriggered) {
            this.lo.uiManager?.showToast?.("Tour paused");
        }
    }

    _runTick() {
        if (!this.isPlaying) return;

        const now = performance.now();
        const dwell = this.getDwellTime();
        const elapsed = now - this.stepStartTime;
        const progress = Math.min(1, elapsed / dwell);

        this.lo.tourUIManager?.setProgress(progress);

        if (progress >= 1) {
            this.next();
            this.stepStartTime = performance.now();
        }

        this.rafId = requestAnimationFrame(() => this._runTick());
    }
}