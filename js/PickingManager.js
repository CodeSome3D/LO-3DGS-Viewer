export class PickingManager {

    constructor(lo) {

        this.lo = lo;

        this.mouseDown = false;
        this.dragged = false;

        this.startX = 0;
        this.startY = 0;

        this.dragThreshold = 5;
    }

    enable() {

        const canvas = this.lo.canvas;

        canvas.addEventListener(
            "mousedown",
            e => this.onMouseDown(e)
        );

        canvas.addEventListener(
            "mousemove",
            e => this.onMouseMove(e)
        );

        canvas.addEventListener(
            "mouseup",
            e => this.onMouseUp(e)
        );

        canvas.addEventListener(
            "click",
            e => this.onClick(e)
        );
    }

    onMouseDown(e) {

        this.mouseDown = true;

        this.dragged = false;

        this.startX = e.clientX;
        this.startY = e.clientY;
    }

    onMouseMove(e) {

        if (!this.mouseDown) {
            return;
        }

        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;

        if (Math.hypot(dx, dy) > this.dragThreshold) {

            this.dragged = true;

        }
    }

    onMouseUp() {

        this.mouseDown = false;
    }

    async onClick(e) {
        
        if (this.dragged) {

            this.dragged = false;

            return;
        }

        if (e.target !== this.lo.canvas) {
            return;
        }

        const canvas = this.lo.canvas;

        const rect = canvas.getBoundingClientRect();

        const x =
            (e.clientX - rect.left) / rect.width;

        const y =
            (e.clientY - rect.top) / rect.height;

        const point =
            await this.lo.viewer.picker.pick(x, y);
        
        if (!point) {
            this.lo.clearHotspotSelection();
            return;
        }

        this.lo.lastPickedPoint = point;

        if (this.lo.waitingForHotspotPick) {

            this.placeHotspot();

            return;
        }

        if (this.lo.moveHotspotMode) {

            this.moveHotspot(point);

            return;
        }

        this.lo.clearHotspotSelection();
        this.lo.focusPoint(point);
    }

    placeHotspot() {

        this.lo.waitingForHotspotPick = false;

        document
            .getElementById("lo-add-hotspot")
            ?.classList.remove("active");

        this.lo.canvas.style.cursor = "";

        const hotspot =
            this.lo.hotspotManager.create(
                "New Hotspot"
            );

        if (!hotspot) {
            return;
        }

        this.lo.hotspotManager.select(
            hotspot.id
        );
    }

    moveHotspot(point) {

        const hotspot =
            this.lo.selectedHotspot;

        if (!hotspot) {
            return;
        }

        hotspot.position = {

            x: point.x,
            y: point.y,
            z: point.z

        };

        this.lo.moveHotspotMode = false;

        this.lo.hotspotManager.refresh();

        this.lo.uiManager.showToast(
            "Hotspot moved."
        );
    }

}