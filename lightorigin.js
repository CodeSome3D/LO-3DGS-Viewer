// Core
import { Serializer } from "./js/Serializer.js";
import { ProjectManager } from "./js/ProjectManager.js";

// Cameras
import { LOCamera } from "./js/LOCamera.js";
import { CameraManager } from "./js/CameraManager.js";

// Hotspots & Tours
import { HotspotManager } from "./js/HotspotManager.js";
import { TourManager } from "./js/TourManager.js";
import { TourUIManager } from "./js/TourUIManager.js";

import { PickingManager } from "./js/PickingManager.js";
import { UIManager } from "./js/UIManager.js";

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

                url: ""

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
    cameraCounter: 0,
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
        this.projectManager = new ProjectManager(this);
        this.uiManager = new UIManager(this);
        this.pickingManager = new PickingManager(this);

        console.log("LightOrigin space initialized");
        
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

    loadProjectFromURL(url) {
        return this.projectManager.loadFromURL(url);
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

        if (theme === "dark") {

            root.style.setProperty("--lo-bg", "#262626");
            root.style.setProperty("--lo-panel", "#2c2c2c");
            root.style.setProperty("--lo-panel-hover", "#3a3a3a");
            root.style.setProperty("--lo-button", "#353535");
            root.style.setProperty("--lo-border", "#444");
            root.style.setProperty("--lo-text", "#ffffff");
            root.style.setProperty("--lo-text-secondary", "#999");
            root.style.setProperty("--lo-accent", "#22C7B8");
            this.projectcard.background.type = "color";
            this.projectcard.background.color = "#0A1D24";

            const picker = document.getElementById("lo-bg-picker");

            if (picker) {
                picker.value = this.projectcard.background.color;
            }

            this.applyBackground();

            const logo = document.querySelector("#lightorigin-logo img");

            if (logo) {
                logo.style.filter = "none";
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

            this.projectcard.background.type = "color";
            this.projectcard.background.color = "#F4F6F8";

            const picker = document.getElementById("lo-bg-picker");

            if (picker) {
                picker.value = this.projectcard.background.color;
            }

            this.applyBackground();

            const logo = document.querySelector("#lightorigin-logo img");

            if (logo) {
                logo.style.filter = "invert(1)";
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
    window.lo.setTheme(window.lo.projectcard.theme);

    const global =
        window.viewer.inputController?._global;

    global?.events?.fire(
        "controlsHidden:changed",
        true
    );

    if (window.lo.isEditor()) {

        window.lo.createUI();
    }

    if (window.lo.isViewer()) {

        window.lo.tourUIManager.create();

        window.lo
            .loadProjectFromURL("project.lo.json")
            .then(() => {

                if (
                    !window.lo.projectcard.autospinOnLoad
                ) {

                    window.lo.tourManager.start();
                }
            })
            .catch(error => {

                console.error(
                    "Viewer project load failed:",
                    error
                );
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