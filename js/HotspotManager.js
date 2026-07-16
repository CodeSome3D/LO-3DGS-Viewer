export class HotspotManager {

    constructor(lo) {
        this.lo = lo;
        this.element = null;
    }

    create(title = "") {

        if (!this.lo.lastPickedPoint) {
            console.warn("Nothing picked.");
            return null;
        }

        const cameraId = `camera-${this.lo.cameraCounter++}`;

        this.lo.cameras[cameraId] = this.lo.cameraManager.capture();

        const hotspot = {

            id: crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now().toString(),

            title,
            description: "",
            color: "#ff7a00",

            position: { ...this.lo.lastPickedPoint },

            cameraId
        };

        this.lo.hotspots.push(hotspot);

        return hotspot;
    }

    select(id) {

        this.lo.selectedHotspot =
            this.lo.hotspots.find(h => h.id === id) ?? null;

        this.refresh();
    }

    clearSelection() {

        this.lo.selectedHotspot = null;

        this.refresh();
    }

    delete(id) {

        const hotspot =
            this.lo.hotspots.find(h => h.id === id);

        if (!hotspot) {
            return;
        }

        hotspot.element?.remove();
        hotspot.element = null;

        this.lo.hotspots =
            this.lo.hotspots.filter(h => h !== hotspot);

        delete this.lo.cameras[hotspot.cameraId];

        if (this.lo.selectedHotspot === hotspot) {
            this.lo.selectedHotspot = null;
        }

        this.lo.uiManager?.refresh();
    }

    deleteSelected() {

        if (!this.lo.selectedHotspot) {
            return;
        }

        this.delete(this.lo.selectedHotspot.id);
    }

    rename(title) {

        if (!this.lo.selectedHotspot) {
            return;
        }

        this.lo.selectedHotspot.title = title;

        this.refresh();
    }

    startMove() {

        if (!this.lo.selectedHotspot) {
            return;
        }

        this.lo.moveHotspotMode = true;

        this.lo.uiManager.showToast(
            "Click a new position for the hotspot."
        );
    }

    refresh() {

        this.render();

        this.update();

        if (this.lo.isEditor()) {

            this.lo.uiManager?.refresh();
        }
    }

    render() {

        for (const hotspot of this.lo.hotspots) {

            if (
                hotspot.element instanceof HTMLElement &&
                hotspot.element.isConnected
            ) {
                continue;
            }

            hotspot.element = null;

            const p =
                this.lo.project(hotspot.position);

            if (!p) {
                continue;
            }

            const element = document.createElement("div");

            element.className = "lo-hotspot lo-hotspot-marker";
            element.id = `lo-hotspot-${hotspot.id}`;

            element.style.left = `${p.x - 22}px`;
            element.style.top = `${p.y - 22}px`;

            const marker = document.createElement("div");
            marker.className = "lo-hotspot-dot";

            marker.classList.toggle(
                "selected",
                hotspot === this.lo.selectedHotspot
            );

            const label = document.createElement("span");
            label.className = "lo-hotspot-label";
            label.textContent = hotspot.title;

            const description = document.createElement("div");
            description.className = "lo-hotspot-description";
            description.textContent = hotspot.description || "";

            element.append(marker, label, description);

            element.onclick = e => {

                e.stopPropagation();

                if (this.lo.isEditor()) {

                    this.select(hotspot.id);

                    return;
                }

                this.lo.cameraManager.goTo(
                    hotspot.cameraId
                );

                this.lo.tourManager.setCurrent(
                    hotspot.id
                );

                this.lo.tourUIManager?.update(
                    hotspot
                );
            };

            element.onwheel = e => {

                e.preventDefault();

                this.lo.canvas.dispatchEvent(
                    new WheelEvent("wheel", {
                        deltaX: e.deltaX,
                        deltaY: e.deltaY,
                        deltaZ: e.deltaZ,
                        deltaMode: e.deltaMode,
                        bubbles: true,
                        cancelable: true
                    })
                );
            };

            hotspot.element = element;

            document
                .getElementById("lo-viewer")
                .appendChild(element);
        }
    }

    update() {
        
        for (const hotspot of this.lo.hotspots) {

            const element =
                document.getElementById(
                    `lo-hotspot-${hotspot.id}`
                );

            if (!element) {
                continue;
            }

            const p =
                this.lo.project(hotspot.position);

            if (!p) {

                element.style.display = "none";

                continue;
            }

            const marker =
                element.querySelector(".lo-hotspot-dot");

            if (marker) {

                marker.classList.toggle(
                    "selected",
                    hotspot === this.lo.selectedHotspot
                );

                marker.style.background =
                    hotspot.color || "#ff7a00";
            }

            const label =
                element.querySelector(".lo-hotspot-label");

            if (label) {

                label.textContent = hotspot.title;

                label.classList.toggle(
                    "hidden",
                    !hotspot.title.trim()
                );
            }

            const description =
                element.querySelector(".lo-hotspot-description");

            if (description) {

                description.textContent =
                    hotspot.description || "";

                description.classList.toggle(
                    "hidden",
                    !hotspot.description.trim()
                );

                const spaceBelow =
                    window.innerHeight - p.y;

                description.classList.toggle(
                    "position-above",
                    spaceBelow < 180
                );
            }

            const spaceRight =
                window.innerWidth - p.x;

            description.classList.toggle(
                "position-left",
                spaceRight < 320
            );

            const w = window.innerWidth;
            const h = window.innerHeight;

            const fade = 60;

            let alpha = 1;

            alpha = Math.min(alpha, p.x / fade);
            alpha = Math.min(alpha, (w - p.x) / fade);

            alpha = Math.min(alpha, p.y / fade);
            alpha = Math.min(alpha, (h - p.y) / fade);

            alpha = Math.max(
                0,
                Math.min(1, alpha)
            );

            element.style.display = "flex";

            element.style.opacity = alpha;

            element.style.left =
                `${p.x - 22}px`;

            element.style.top =
                `${p.y - 22}px`;
        }
    }

}