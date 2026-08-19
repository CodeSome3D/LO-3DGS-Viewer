export class TourManager {

    constructor(lo) {
        this.lo = lo;
        this.currentHotspotIndex = -1;
    }

    get tourHotspots() {
        return (this.lo.hotspots || []).filter(h => h.type !== "portal");
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
    }
}