export class TourManager {

    constructor(lo) {
        this.lo = lo;
        this.currentHotspotIndex = -1;
    }

    start() {

        if (this.lo.hotspots.length === 0) {
            return;
        }

        this.currentHotspotIndex = 0;

        const hotspot =
            this.lo.hotspots[0];

        this.goTo(hotspot);
    }

    setCurrent(hotspotId) {

        const index =
            this.lo.hotspots.findIndex(
                hotspot =>
                    hotspot.id === hotspotId
            );

        if (index === -1) {
            return;
        }

        this.currentHotspotIndex = index;
    }

    next() {

        if (this.lo.hotspots.length === 0) {
            return;
        }

        this.currentHotspotIndex++;

        if (
            this.currentHotspotIndex >=
            this.lo.hotspots.length
        ) {
            this.currentHotspotIndex = 0;
        }

        const hotspot =
            this.lo.hotspots[
                this.currentHotspotIndex
            ];

        this.goTo(hotspot);
    }

    previous() {

        if (this.lo.hotspots.length === 0) {
            return;
        }

        this.currentHotspotIndex--;

        if (this.currentHotspotIndex < 0) {

            this.currentHotspotIndex =
                this.lo.hotspots.length - 1;
        }

        const hotspot =
            this.lo.hotspots[
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
    }
}