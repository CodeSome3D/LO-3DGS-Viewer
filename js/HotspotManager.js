import { IconLibrary } from "./IconLibrary.js";

export class HotspotManager {

    constructor(lo) {
        this.lo = lo;
        this.element = null;
    }

    create(title = "", type = "hotspot") {

        if (!this.lo.lastPickedPoint) {
            console.warn("Nothing picked.");
            return null;
        }

        const cameraId = `camera-${this.lo.cameraCounter++}`;

        this.lo.cameras[cameraId] = this.lo.cameraManager.capture();

        const isPortal = type === "portal";

        const hotspot = {

            id: crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now().toString(),

            title: title || (isPortal ? "New Portal" : "New Hotspot"),
            description: "",
            color: isPortal ? "#00e5ff" : "#ff7a00",
            type: isPortal ? "portal" : "hotspot",
            icon: isPortal ? "portal" : "default",
            customSvg: "",
            targetUrl: "",

            position: { ...this.lo.lastPickedPoint },

            cameraId
        };

        this.lo.hotspots.push(hotspot);

        return hotspot;
    }

    select(id) {

        this.lo.selectedHotspot =
            this.lo.hotspots.find(
                hotspot =>
                    hotspot.id === id
            );

        if (this.lo.isEditor()) {

            this.lo.uiManager?.refresh();
        }
    }

    clearSelection() {

        this.lo.selectedHotspot = null;

        this.refresh();
    }

    delete(id) {

        this.lo.hotspots =
            this.lo.hotspots.filter(
                hotspot =>
                    hotspot.id !== id
            );

        if (
            this.lo.selectedHotspot?.id === id
        ) {
            this.lo.selectedHotspot = null;
        }

        this.lo.renderHotspots();

        if (this.lo.isEditor()) {

            this.lo.uiManager?.refresh();
        }
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

        this.lo.uiManager?.showToast(
            "Click on the model to place the hotspot"
        );
    }

    applyMovedPosition(point) {

        if (
            !this.lo.selectedHotspot ||
            !point
        ) {
            return;
        }

        this.lo.selectedHotspot.position =
            { ...point };

        this.lo.moveHotspotMode = false;

        this.lo.renderHotspots();

        if (this.lo.isEditor()) {

            this.lo.uiManager?.refresh();
        }

        this.lo.uiManager?.showToast(
            "✓ Hotspot position updated"
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

        const container =
            document.getElementById("lo-viewer");

        if (!container) {
            return;
        }

        container
            .querySelectorAll(".lo-hotspot")
            .forEach(e => e.remove());

        for (const hotspot of this.lo.hotspots) {

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
            
            const iconHtml = IconLibrary.getIconHTML(hotspot.icon, hotspot.customSvg, hotspot.type);
            if (iconHtml) {
                marker.innerHTML = iconHtml;
                marker.classList.add("has-icon");
            }

            if (hotspot.type === "portal") {
                marker.classList.add("lo-portal-dot");
                marker.style.background = "";
            } else {
                marker.style.background = hotspot.color || "#ff7a00";
            }

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

                if (hotspot.type === "portal") {
                    if (hotspot.targetUrl) {
                        const targetTitle = hotspot.title || "Next Scene";
                        this.lo.showTransition?.(targetTitle, "LOADING").then(() => {
                            return this.lo.projectManager.loadFromURL(hotspot.targetUrl);
                        }).catch(e => {
                            console.error("Failed to load portal:", e);
                            this.lo.uiManager?.showToast("❌ Failed to load portal project");
                        }).finally(() => {
                            setTimeout(() => {
                                this.lo.hideTransition?.();
                            }, 250);
                        });
                    } else {
                        console.warn("Portal has no target URL configured.");
                    }
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

                const isPortal = hotspot.type === "portal";
                marker.classList.toggle("lo-portal-dot", isPortal);

                const iconHtml = IconLibrary.getIconHTML(hotspot.icon, hotspot.customSvg, hotspot.type);
                marker.innerHTML = iconHtml;
                marker.classList.toggle("has-icon", Boolean(iconHtml));

                if (isPortal) {
                    marker.style.background = "";
                } else {
                    marker.style.background =
                        hotspot.color || "#ff7a00";
                }
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