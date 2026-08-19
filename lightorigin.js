import { LightOrigin } from "./js/LightOrigin.js";
// Core
import { Serializer } from "./js/Serializer.js";
import { ProjectManager } from "./js/ProjectManager.js";
import { EventBus } from "./js/EventBus.js";

// Cameras
import { LOCamera } from "./js/LOCamera.js";
import { CameraManager } from "./js/CameraManager.js";

// Hotspots & Tours
import { HotspotManager } from "./js/HotspotManager.js";
import { TourManager } from "./js/TourManager.js";
import { TourUIManager } from "./js/TourUIManager.js";

import { UIManager } from "./js/UIManager.js";
import { PickingManager } from "./js/PickingManager.js";
import { BackgroundManager } from "./js/BackgroundManager.js";

window.lo = {
    projectcard: {

        name: "Untitled Project",

        version: 1,

        theme: "dark",

        autospinOnLoad: false,
        
        background: {

            type: "color",
            color: "#2a2a2a",
            gradient: {
                mode: "linear",
                angle: 135,
                colors: [
                    "#202020",
                    "#606060"
                ]
            },

            image: {
                url: "",
                fit: "cover"
            },

            panorama: {
                url: "",
                rotation: 0
            }

        }
    },
    waitingForHotspotPick: false,
    mode:
        new URLSearchParams(window.location.search)
            .get("mode") === "viewer"
                ? "viewer"
                : "editor",
    viewer: null,
    cameras: {},
    hotspots: [],
    hotspotCounter: 0,
    cameraCounter: 1,
    lastPickedPoint: null,
    selectedHotspot: null,
    currentHotspotIndex: -1,
    moveHotspotMode: false,
    isTyping: false,

    settings: {
        hotspotOcclusion: false
    },

    get canvas() {
        return document.getElementById("application-canvas");
    },

    init(viewer) {
        this.loadCSS();

        this.viewer = viewer;
        
        const canvas = this.canvas;

        const viewerContainer = document.createElement("div");

        viewerContainer.id = "lo-viewer";

        Object.assign(viewerContainer.style, {
            position: "fixed",
            inset: "0",
            overflow: "hidden"
        });

        canvas.parentNode.insertBefore(
            viewerContainer,
            canvas
        );

        viewerContainer.appendChild(canvas);
        
        this.hotspotManager = new HotspotManager(this);
        this.cameraManager = new CameraManager(this);
        this.tourManager = new TourManager(this);
        this.tourUIManager = new TourUIManager(this);
        this.serializer = new Serializer(this);
        this.backgroundManager = new BackgroundManager(this);
        this.projectManager = new ProjectManager(this);
        this.uiManager = new UIManager(this);
        this.pickingManager = new PickingManager(this);
        

        console.log("LightOrigin space initialized");
        
        if (viewer?.global?.config?.contentUrl) {
            this.projectcard.scene = viewer.global.config.contentUrl;
            this.currentLoadedSplatUrl = viewer.global.config.contentUrl;
        } else {
            this.currentLoadedSplatUrl = null;
        }

        this.viewer.global.app.on("postrender", () => {
            this.updateHotspots();
        });

        this.applyBackground();

        window.addEventListener("keydown", (e) => {
                if (this.isTyping()) {
                    return;
                }
            switch (e.key) {
                case "Delete":
                    this.deleteSelectedHotspot();
                    break;

                case "F2":
                    e.preventDefault();
                    this.renameSelectedHotspot();
                    break;
                case "m":
                case "M":
                    this.startMoveHotspot();
                    break;
                case "]":
                    e.preventDefault();
                    this.nextHotspot();
                    break;

                case "[":
                    e.preventDefault();
                    this.previousHotspot();
                    break;
                case "Escape":

                    if (this.waitingForHotspotPick) {

                        this.waitingForHotspotPick = false;

                        const addButton = document.getElementById("lo-add-hotspot");

                        if (addButton) {
                            addButton.classList.remove("active");
                        }

                        this.canvas.style.cursor = "";

                        e.preventDefault();
                    }

                    break;
            }
        });

        window.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        window.addEventListener("drop", async (e) => {
            e.preventDefault();
            const file = e.dataTransfer?.files?.[0];
            if (!file) return;
            const name = file.name.toLowerCase();
            if (name.endsWith(".sog") || name.endsWith(".ply")) {
                this.uiManager?.showToast(`Loading ${file.name}...`);
                try {
                    await this.loadGsplat(file, (p) => {
                        if (p < 100) this.uiManager?.showToast(`Loading 3DGS: ${p}%`);
                    });
                    this.uiManager?.showToast("✓ 3DGS loaded successfully");
                } catch (err) {
                    this.uiManager?.showToast("❌ Failed to load 3DGS model");
                }
            } else if (name.endsWith(".lo.json") || name.endsWith(".json")) {
                this.loadProject(file);
            }
        });
    },

    get camera() {
        return this.viewer.cameraManager.camera;
    },

    isTyping() {

        const el = document.activeElement;

        if (!el) {
            return false;
        }

        return (
            el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            el.isContentEditable
        );

    },

    logCamera() {
        console.log({
            position: this.camera.position,
            angles: this.camera.angles,
            distance: this.camera.distance,
            fov: this.camera.fov
        });
    },

    moveCloser() {
        this.camera.distance *= 0.5;
        this.viewer.cameraManager.snap();
    },

    inspectCameraManager() {
        console.dir(this.viewer.cameraManager);
    },

    testSnap() {
        const cm = this.viewer.cameraManager;

        console.log("Before:", cm.camera.distance);

        cm.camera.distance *= 0.5;

        console.log("Modified:", cm.camera.distance);

        cm.snap();

        console.log("After snap:", cm.camera.distance);
    },

    inspectState() {
        console.log(this.viewer.global.state);
    },

    getController() {
        return this.viewer.cameraManager.getController();
    },

    getCameraMode() {
        return this.viewer.global.state.cameraMode;
    },

    setCameraMode(mode) {
        this.viewer.global.state.cameraMode = mode;
    },

    inspectOrbitController() {
        const controller = this.getController().controller;

        console.dir(controller._rootPose);
        console.log(Object.getOwnPropertyNames(controller._rootPose));
    },

    setCamera(camera) {
        return this.cameraManager.apply(camera);
    },

    flyTo(position, target, fov) {
        return this.cameraManager.flyTo(position, target, fov);
    },

    lookAt(position, target, fov) {
        return this.cameraManager.lookAt(position, target, fov);
    },

    forceOrbit() {
        return this.cameraManager.forceOrbit();
    },

    setDamping(move, rotate = move, zoom = move) {
        return this.cameraManager.setDamping(move, rotate, zoom);
    },

    getOrbitController() {
        return this.cameraManager.getOrbitController();
    },

    updateSelectedHotspotCamera() {
        return this.cameraManager.updateSelected();
    },

    pick(x, y) {
        return this.viewer.picker.pick(x, y);
    },

    async pickCenter() {
        return await this.viewer.picker.pick(0.5, 0.5);
    },

    async pickNormalized(x, y) {
        return await this.viewer.picker.pick(x, y);
    },

    enablePicking() {
        this.pickingManager.enable();
    },

    focusPoint(point, distance = 20) {

        const camera = this.cameraManager.capture();

        const yaw = camera.angles.y * Math.PI / 180;
        const pitch = camera.angles.x * Math.PI / 180;

        const cp = Math.cos(pitch);

        const position = {
            x: point.x + Math.sin(yaw) * cp * distance,
            y: point.y - Math.sin(pitch) * distance,
            z: point.z + Math.cos(yaw) * cp * distance
        };

        this.flyTo(position, point, camera.fov);
    },

    createHotspot(title = "") {
        return this.hotspotManager.create(title);
    },

    selectHotspot(id) {
        return this.hotspotManager.select(id);
    },

    clearHotspotSelection() {
        this.hotspotManager.clearSelection();
    },

    deleteSelectedHotspot() {
        return this.hotspotManager.deleteSelected();
    }, 
    
    renameSelectedHotspot(title) {
        return this.hotspotManager.rename(title);
    },

    startMoveHotspot() {
        return this.hotspotManager.startMove();
    },

    saveProject(filename) {
        return this.projectManager.save(filename);
    },

    loadProject(file) {
        return this.projectManager.load(file);
    },

    showTransition(title = "Entering Scene...", subtitle = "LOADING") {
        let overlay = document.getElementById("lo-transition-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "lo-transition-overlay";
            overlay.innerHTML = `
                <div class="lo-transition-portal-icon">🌀</div>
                <div class="lo-transition-title" id="lo-transition-title">Entering Scene...</div>
                <div class="lo-transition-subtitle" id="lo-transition-subtitle">LOADING</div>
            `;
            document.body.appendChild(overlay);
        }
        const titleEl = document.getElementById("lo-transition-title");
        const subtitleEl = document.getElementById("lo-transition-subtitle");
        if (titleEl) titleEl.textContent = title;
        if (subtitleEl) subtitleEl.textContent = subtitle;

        overlay.classList.add("active");
        return new Promise(resolve => setTimeout(resolve, 450));
    },

    hideTransition() {
        const overlay = document.getElementById("lo-transition-overlay");
        if (overlay) {
            overlay.classList.remove("active");
        }
    },

    loadProjectFromURL(url) {
        return this.projectManager.loadFromURL(url);
    },

    async loadGsplat(urlOrFile, progressCallback) {
        if (!this.viewer?.loadGsplat) {
            console.warn("Viewer is not initialized yet.");
            return null;
        }
        if (typeof urlOrFile === 'string') {
            this.projectcard.scene = urlOrFile;
            this.currentLoadedSplatUrl = urlOrFile;
            if (this.viewer?.global?.config) {
                this.viewer.global.config.contentUrl = urlOrFile;
            }
        } else if (urlOrFile instanceof File) {
            this.projectcard.scene = urlOrFile.name;
            this.currentLoadedSplatUrl = urlOrFile.name;
        }
        const res = await this.viewer.loadGsplat(urlOrFile, progressCallback);
        if (res && typeof urlOrFile === 'string') {
            this.currentLoadedSplatUrl = urlOrFile;
            if (this.viewer?.global?.config) {
                this.viewer.global.config.contentUrl = urlOrFile;
            }
        }
        document.documentElement.style.setProperty('--canvas-opacity', '1');
        const poster = document.getElementById('poster');
        if (poster) {
            poster.style.display = 'none';
        }
        return res;
    },

    unloadGsplat() {
        this.currentLoadedSplatUrl = null;
        if (this.viewer?.global?.config) {
            this.viewer.global.config.contentUrl = "";
        }
        if (!this.viewer?.unloadGsplat) {
            return;
        }
        this.viewer.unloadGsplat();
    },

    frame(bbox = null, fov = null) {
        if (this.viewer?.frame) {
            this.viewer.frame(bbox, fov);
        }
    },

    nextHotspot() {
       return this.tourManager.next();
    },

    previousHotspot() {
        return this.tourManager.previous();
    },

    renderHotspots() {
        return this.hotspotManager.render();
    },

    updateHotspots() {
        return this.hotspotManager.update();
    },

    getPCCamera() {
        return this.viewer.global.app.scene.layers
            .getLayerByName("World")
            .cameras[0];
    },

    project(point) {

        const camera = this.getPCCamera();
        const camPos = camera.entity.getPosition();
        const camForward = camera.entity.forward;

        const toPoint = {
            x: point.x - camPos.x,
            y: point.y - camPos.y,
            z: point.z - camPos.z
        };

        const dot =
            camForward.x * toPoint.x +
            camForward.y * toPoint.y +
            camForward.z * toPoint.z;

        if (dot <= 0) {
            return null;
        }

        return camera.worldToScreen(point);
    },

    loadCSS() {

        if (document.getElementById("lo-css")) {
            return;
        }

        const link = document.createElement("link");

        link.id = "lo-css";
        link.rel = "stylesheet";
        link.href = "lightorigin.css";

        document.head.appendChild(link);
    },

    async isHotspotVisible(hotspot) {
        const screen = this.project(hotspot.position);

        const rect = this.canvas.getBoundingClientRect();

        const x = screen.x / rect.width;
        const y = screen.y / rect.height;

        const picked = await this.viewer.picker.pick(x, y);

        if (!picked) {
            return false;
        }

        const dx = picked.x - hotspot.position.x;
        const dy = picked.y - hotspot.position.y;
        const dz = picked.z - hotspot.position.z;

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        return distance < 0.02;
    },    

    setSetting(name, value) {
        this.settings[name] = value;
    },

    createUI() {
        return this.uiManager.create();
    },

    isEditor() {
        return this.mode === "editor";
    },

    isViewer() {
        return this.mode === "viewer";
    },

    setMode(mode) {
        if (mode !== "editor" && mode !== "viewer") {
            console.warn(`Unknown mode "${mode}"`);
            return;
        }

        this.mode = mode;
    },

    deleteHotspot(id) {
        return this.hotspotManager.delete(id);
        hotspot.element = null;
    },

    applyBackground() {
        return this.projectManager.applyBackground();
    },

    setBackgroundColor(color) {
        return this.projectManager.setBackgroundColor(color);
    },

    setTransparentBackground() {
        return this.projectManager.setTransparentBackground();
    },

    setTheme(theme) {

        const root = document.documentElement;
        const headerLogo = document.getElementById("lo-header-logo");
        const lightoriginLogo = document.querySelector("#lightorigin-logo img");

        if (theme === "dark") {

            root.style.setProperty("--lo-bg", "#262626");
            root.style.setProperty("--lo-panel", "#2c2c2c");
            root.style.setProperty("--lo-panel-hover", "#3a3a3a");
            root.style.setProperty("--lo-button", "#353535");
            root.style.setProperty("--lo-border", "#444");
            root.style.setProperty("--lo-text", "#ffffff");
            root.style.setProperty("--lo-text-secondary", "#999");
            root.style.setProperty("--lo-accent", "#22C7B8");
            if (this.projectcard.background.type === "color") {
                this.projectcard.background.color = "#0A1D24";
                const picker = document.getElementById("lo-bg-picker");
                if (picker) {
                    picker.value = this.projectcard.background.color;
                }
                this.applyBackground();
            }

            if (headerLogo) {
                headerLogo.src = "logo_LO_hor.png";
            }

            if (lightoriginLogo) {
                lightoriginLogo.src = "logo_LO.png";
                lightoriginLogo.style.filter = "none";
            }

            return;
        }

        if (theme === "light") {

            root.style.setProperty("--lo-bg", "#f2f2f2");
            root.style.setProperty("--lo-panel", "#ffffff");
            root.style.setProperty("--lo-panel-hover", "#e9e9e9");
            root.style.setProperty("--lo-button", "#ffffff");
            root.style.setProperty("--lo-border", "#cccccc");
            root.style.setProperty("--lo-text", "#222222");
            root.style.setProperty("--lo-text-secondary", "#666666");
            root.style.setProperty("--lo-accent", "#11998E");

            if (this.projectcard.background.type === "color") {
                this.projectcard.background.color = "#F4F6F8";
                const picker = document.getElementById("lo-bg-picker");
                if (picker) {
                    picker.value = this.projectcard.background.color;
                }
                this.applyBackground();
            }

            if (headerLogo) {
                headerLogo.src = "logo_LO_hor_dark.png";
            }

            if (lightoriginLogo) {
                lightoriginLogo.src = "logo_LO_dark.png";
                lightoriginLogo.style.filter = "none";
            }
        }
    },


};

function init() {

    const viewer = window.viewer;

    if (!viewer?.cameraManager) {
        requestAnimationFrame(init);
        return;
    }

    window.lo.init(viewer);
    document.documentElement.style.setProperty('--canvas-opacity', '1');
    window.lo.setTheme(window.lo.projectcard.theme);

    const global =
        window.viewer.inputController?._global;

    global?.events?.fire(
        "controlsHidden:changed",
        true
    );

    const params = new URLSearchParams(window.location.search);
    const projectUrl = params.get("project");

    if (window.lo.isEditor()) {
        window.lo.createUI();
        if (projectUrl) {
            window.lo.loadProjectFromURL(projectUrl).catch(err => {
                console.warn("Editor project load warning:", err);
            });
        }
    }

    if (window.lo.isViewer()) {
        const buttonsContainer = document.getElementById("buttonsContainer");
        if (buttonsContainer) {
            buttonsContainer.style.display = "none";
        }

        window.lo.tourUIManager.create();

        window.ensureInitialViewButton = () => {
            let initialViewBtn = document.getElementById("lo-initial-view-btn");
            if (!window.lo.cameras["camera-0"]) {
                if (initialViewBtn) initialViewBtn.style.display = "none";
                return;
            }
            if (!initialViewBtn) {
                initialViewBtn = document.createElement("button");
                initialViewBtn.id = "lo-initial-view-btn";
                initialViewBtn.textContent = "Initial View";
                initialViewBtn.style.position = "absolute";
                initialViewBtn.style.bottom = "20px";
                initialViewBtn.style.left = "50%";
                initialViewBtn.style.transform = "translateX(-50%)";
                initialViewBtn.style.padding = "8px 24px";
                initialViewBtn.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                initialViewBtn.style.color = "white";
                initialViewBtn.style.border = "1px solid rgba(255, 255, 255, 0.2)";
                initialViewBtn.style.borderRadius = "20px";
                initialViewBtn.style.fontFamily = "sans-serif";
                initialViewBtn.style.fontSize = "14px";
                initialViewBtn.style.cursor = "pointer";
                initialViewBtn.style.zIndex = "1000";
                initialViewBtn.style.backdropFilter = "blur(4px)";
                initialViewBtn.style.transition = "background-color 0.2s";
                
                initialViewBtn.onmouseenter = () => {
                    initialViewBtn.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                };
                initialViewBtn.onmouseleave = () => {
                    initialViewBtn.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                };
                
                initialViewBtn.onclick = () => {
                    window.lo.cameraManager.goTo("camera-0");
                    window.lo.tourManager.currentHotspotIndex = -1;
                    window.lo.tourUIManager?.update(null); // Hide tour UI
                };
                
                document.body.appendChild(initialViewBtn);
            } else {
                initialViewBtn.style.display = "block";
            }
        };

        if (projectUrl) {
            window.lo
                .loadProjectFromURL(projectUrl)
                .then(() => {
                    window.ensureInitialViewButton();
                })
                .catch(error => {
                    console.error(
                        "Viewer project load failed:",
                        error
                    );
                });
        } else {
            if (window.lo.projectcard.autospinOnLoad) {
                window.lo.cameraManager.startAutospin();
            }
        }

        window.addEventListener("popstate", () => {
            const p = new URLSearchParams(window.location.search).get("project");
            if (p) {
                window.lo.showTransition?.(p, "LOADING").then(() => {
                    return window.lo.loadProjectFromURL(p, false);
                }).catch(e => {
                    console.error("Popstate project load failed:", e);
                }).finally(() => {
                    setTimeout(() => {
                        window.lo.hideTransition?.();
                    }, 250);
                });
            }
        });

        const logo =
            document.getElementById("viewerBranding");

        if (logo) {
            logo.style.left = "24px";
        }
    }

    window.lo.enablePicking();
    window.lo.renderHotspots();
}

init();