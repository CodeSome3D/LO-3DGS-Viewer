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
//import { UIManager } from "./js/UIManager.js";

class UIManager {
    constructor(lo) {
        this.lo = lo;
    }

    create() {
        if (document.getElementById("lo-editor")) {
            return;
        }

        if (!this.lo.isEditor()) {
            return;
        }

        const style = document.createElement("style");

        document.head.appendChild(style);

        const root = document.createElement("div");
        root.id = "lo-editor";

        const sidebar = document.createElement("div");
        sidebar.id = "lo-sidebar";

        root.appendChild(sidebar);

        document.body.appendChild(root);

        const toast = document.createElement("div");
        toast.id = "lo-toast";

        document.body.appendChild(toast);

        // Populate the sidebar with UI elements
        sidebar.innerHTML = `
            <div id="lo-header">
                <img
                    id="lo-header-logo"
                    src="logo_LO_hor.png"
                    alt="LightOrigin">
            </div>

            <div class="lo-section">
                <h2>Project</h2>
                <div id="lo-project">

                    <div id="lo-project-name"></div>

                    <div class="lo-section">

                        <div class="lo-section-title">Background</div>

                        <label for="lo-bg-type">Type</label>

                        <select id="lo-bg-type" class="lo-select">
                            <option value="transparent">Transparent</option>
                            <option value="color">Solid Color</option>
                            <option value="gradient">Gradient</option>
                            <option value="image">Image</option>
                            <!-- Future -->
                            <!-- <option value="panorama">360° Panorama</option> -->
                        </select>

                        <label for="lo-bg-picker">Color</label>

                        <div class="lo-section">

                            <div class="lo-section-title">Theme</div>

                            <select id="lo-theme" class="lo-select">
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                            </select>

                        </div>

                        <label class="lo-checkbox-row">

                            <input
                                id="lo-autospin-on-load"
                                type="checkbox">

                            <span>Autospin on load</span>

                        </label>

                        <div id="lo-color-controls">

                            <label for="lo-bg-picker">
                                Background Color
                            </label>

                            <input
                                id="lo-bg-picker"
                                type="color"
                                value="#1f1f1f">

                        </div>

                        <div id="lo-gradient-controls">

                            <label>Color 1</label>

                            <input
                                id="lo-gradient-color1"
                                type="color"
                                value="#202020">

                            <label>Color 2</label>

                            <input
                                id="lo-gradient-color2"
                                type="color"
                                value="#606060">

                            <label>Angle</label>

                            <input
                                id="lo-gradient-angle"
                                type="range"
                                min="0"
                                max="360"
                                value="135">

                        </div>

                        <div id="lo-image-controls">

                            <button
                                id="lo-bg-image-select"
                                class="lo-button">

                                Select Image

                            </button>

                            <div id="lo-bg-image-name">

                                No image selected

                            </div>

                        </div>

                        <button
                            id="lo-save-project"
                            class="lo-button">
                            💾 Save Project
                        </button>

                        <button
                            id="lo-open-project"
                            class="lo-button">
                            📂 Open Project
                        </button>
                    </div>

                </div>
            </div>

            <div class="lo-section">
                <h2>Hotspots</h2>

                    <div class="lo-toolbar">

                        <button
                            id="lo-add-hotspot"
                            class="lo-button lo-toolbar-button">
                            + Add
                        </button>

                    </div>

                <div id="lo-hotspot-list"></div>
            </div>

            <div class="lo-section">

                <h2>Properties</h2>

                <div id="lo-properties">

                    <div class="lo-empty-state">
                        Select a hotspot to edit its properties.
                    </div>

                </div>

            </div>
        `;
        this.refresh();

        const addButton = document.getElementById("lo-add-hotspot");

        addButton.onclick = () => {

            this.lo.waitingForHotspotPick = true;

            addButton.classList.add("active");

            this.lo.canvas.style.cursor = "crosshair";

            this.showToast("Click the model to place a hotspot.");
        };

        const type = document.getElementById("lo-bg-type");
        const picker = document.getElementById("lo-bg-picker");

        const gradientControls =
            document.getElementById("lo-gradient-controls");

        const colorControls =
            document.getElementById("lo-color-controls");

        colorControls.style.display =

            type.value === "color"

            ? "block"

            : "none";

        gradientControls.style.display =

            type.value === "gradient"

            ? "block"

            : "none";

        const gradientColor1 =
            document.getElementById("lo-gradient-color1");

        const gradientColor2 =
            document.getElementById("lo-gradient-color2");

        const gradientAngle =
            document.getElementById("lo-gradient-angle");

        const imageControls =
            document.getElementById("lo-image-controls");

        const imageButton =
            document.getElementById("lo-bg-image-select");

        const imageName =
            document.getElementById("lo-bg-image-name");

        const theme = document.getElementById("lo-theme");

        const autospin = document.getElementById("lo-autospin-on-load");

        document.getElementById("lo-save-project").onclick = () => {

            this.lo.saveProject();
        };

        document.getElementById("lo-open-project").onclick = () => {

            const input = document.createElement("input");

            input.type = "file";
            input.accept = ".json,.lo.json";

            input.onchange = e => {

                const file = e.target.files[0];

                if (file) {
                    this.lo.loadProject(file);
                }
            };

            input.click();
        };

        type.onchange = () => {

            colorControls.style.display =

                type.value === "color"

                ? "block"

                : "none";

            gradientControls.style.display =

                type.value === "gradient"

                ? "block"

                : "none";

            imageControls.style.display =

                type.value === "image"

                ? "block"

                : "none";

            switch (type.value) {

                case "transparent":

                    this.lo.setTransparentBackground();

                    break;

                case "color":

                    this.lo.setBackgroundColor(
                        picker.value
                    );

                    break;

                case "gradient":

                    this.lo.projectManager
                        .setBackgroundGradient(

                            "linear",

                            Number(
                                gradientAngle.value
                            ),

                            [
                                gradientColor1.value,
                                gradientColor2.value
                            ]
                        );

                    break;

                case "image":

                    this.lo.projectcard
                        .background.type = "image";

                    this.lo.projectManager
                        .applyBackground();

                    break;
            }
        };

        theme.onchange = () => {

            this.lo.projectcard.theme = theme.value;

            this.lo.setTheme(theme.value);

        };

        autospin.onchange = () => {

            this.lo.projectcard.autospinOnLoad =
                autospin.checked;
        };

        picker.oninput = () => {

            if (type.value !== "color") {

                type.value = "color";

                type.onchange();
            }

            else {

                this.lo.setBackgroundColor(
                    picker.value
                );
            }
        };

        const updateGradient = () => {

            if (type.value !== "gradient") {

                type.value = "gradient";

                type.onchange();
            }

            else {

                this.lo.projectManager
                    .setBackgroundGradient(

                        "linear",

                        Number(
                            gradientAngle.value
                        ),

                        [
                            gradientColor1.value,
                            gradientColor2.value
                        ]
                    );
            }
        };

        gradientColor1.oninput =
            updateGradient;

        gradientColor2.oninput =
            updateGradient;

        gradientAngle.oninput =
            updateGradient;

        imageButton.onclick = () => {

            const input =
                document.createElement("input");

            input.type = "file";

            input.accept =
                "image/*";

            input.onchange = e => {

                const file =
                    e.target.files[0];

                if (!file) {
                    return;
                }

                this.lo.projectcard
                    .background.image.file = file;

                imageName.textContent =
                    file.name;

                this.lo.projectcard
                    .background.type = "image";

                this.lo.projectcard
                    .background.image.url =
                        "assets/" + file.name;

                this.lo.projectManager
                    .applyBackground();
            };

            input.click();
        };

        const projectName = document.getElementById("lo-project-name");

        projectName.onclick = () => {

            const input = document.createElement("input");

            input.type = "text";
            input.value = this.lo.projectcard.name;

            projectName.innerHTML = "";
            projectName.appendChild(input);

            input.focus();
            input.select();


            const finish = (save) => {

                if (save) {
                    this.lo.projectcard.name = input.value.trim() || "Untitled Project";
                }

                this.refresh();
            };

            input.onkeydown = e => {

                e.stopPropagation();

                if (e.key === "Enter") {
                    finish(true);
                }

                if (e.key === "Escape") {
                    finish(false);
                }
            };

            input.onblur = () => finish(true);
        };
    }

    refresh() {

        this.refreshProject();

        this.refreshHotspotList();

        this.refreshProperties();
    }

    refreshProject() {

        const project = document.getElementById("lo-project-name");
        const name = this.lo.projectcard.name || "Untitled Project";

        project.textContent = name;

        const bg = this.lo.projectcard.background;

        const type = document.getElementById("lo-bg-type");
        const picker = document.getElementById("lo-bg-picker");
        const theme = document.getElementById("lo-theme");
        const autospin = document.getElementById("lo-autospin-on-load");

        if (autospin) {
            autospin.checked =
                this.lo.projectcard.autospinOnLoad
                ?? false;
        }
        theme.value = this.lo.projectcard.theme;

        type.value = bg.type;
        picker.value = bg.color;

        const controls =
            document.getElementById(
                "lo-gradient-controls"
            );

        if (controls) {

            controls.style.display =

                bg.type === "gradient"

                ? "block"

                : "none";
        }
    }

    refreshHotspotList() {

        const list =
            document.getElementById("lo-hotspot-list");

        const updateCameraButton =
            document.getElementById("lo-update-camera");

        if (updateCameraButton) {

            updateCameraButton.disabled =
                !this.lo.selectedHotspot;
        }

        list.innerHTML = "";

        for (const hotspot of this.lo.hotspots) {

            const row =
                document.createElement("div");

            row.className = "lo-hotspot-row";

            if (hotspot === this.lo.selectedHotspot) {

                row.classList.add("selected");
            }

            const title =
                document.createElement("span");

            title.textContent =
                hotspot.title || "(Untitled)";

            const controls =
                document.createElement("div");

            controls.className =
                "lo-hotspot-row-controls";

            const moveUp =
                document.createElement("button");

            moveUp.className =
                "lo-hotspot-order-button";

            moveUp.textContent = "▲";

            const moveDown =
                document.createElement("button");

            moveDown.className =
                "lo-hotspot-order-button";

            moveDown.textContent = "▼";

            const remove =
                document.createElement("button");

            remove.className =
                "lo-delete-button";

            remove.textContent = "🗑";

            controls.append(
                moveUp,
                moveDown,
                remove
            );

            row.append(
                title,
                controls
            );

            moveUp.onclick = e => {

                e.stopPropagation();

                const index =
                    this.lo.hotspots.indexOf(hotspot);

                if (index < 0) {
                    return;
                }

                this.lo.hotspots.splice(index, 1);

                const newIndex =
                    index === 0
                        ? this.lo.hotspots.length
                        : index - 1;

                this.lo.hotspots.splice(
                    newIndex,
                    0,
                    hotspot
                );

                this.refreshHotspotList();
            };

            moveDown.onclick = e => {

                e.stopPropagation();

                const index =
                    this.lo.hotspots.indexOf(hotspot);

                if (index < 0) {
                    return;
                }

                this.lo.hotspots.splice(index, 1);

                const newIndex =
                    index === this.lo.hotspots.length
                        ? 0
                        : index + 1;

                this.lo.hotspots.splice(
                    newIndex,
                    0,
                    hotspot
                );

                this.refreshHotspotList();
            };

            remove.addEventListener(
                "click",
                e => {

                    e.preventDefault();
                    e.stopImmediatePropagation();

                    this.lo.deleteHotspot(
                        hotspot.id
                    );

                },
                true
            );

            row.addEventListener(
                "click",
                () => {

                    this.lo.selectHotspot(
                        hotspot.id
                    );
                }
            );

            list.appendChild(row);
        }
    }

    refreshProperties() {

        const properties =
            document.getElementById("lo-properties");

        if (!properties) {
            return;
        }

        if (!this.lo.selectedHotspot) {

            properties.innerHTML = `
                <div class="lo-empty-state">
                    Select a hotspot to edit its properties.
                </div>
            `;

            return;
        }

    properties.innerHTML = `
        <div class="lo-property-card">

            <div class="lo-section-title">
                Title
            </div>

            <div class="lo-hotspot-title-row">

                <input
                    id="lo-hotspot-title"
                    type="text"
                    maxlength="30"
                    value="${this.lo.selectedHotspot.title}">

                <input
                    id="lo-hotspot-color"
                    type="color"
                    value="${this.lo.selectedHotspot.color || "#ff7a00"}">

            </div>

                <div class="lo-section-title">
                    Description
                </div>

                <textarea
                    id="lo-hotspot-description"
                    rows="5">${this.lo.selectedHotspot.description || ""}</textarea>

                <div class="lo-section-title">
                    Color
                </div>



            <div class="lo-section-title">
                cardrmation
            </div>

            <div class="lo-property-card">

                <div>
                    <strong>ID</strong><br>
                    ${this.lo.selectedHotspot.id}
                </div>
                <div style="margin-top:8px">
                    <strong>Camera</strong><br>
                    ${this.lo.selectedHotspot.cameraId}
                </div>

            </div>

            <div class="lo-section-title">
                Camera
            </div>

            <button
                id="lo-goto-camera"
                class="lo-button">
                📷 Go To Camera
            </button>

            <button
                id="lo-update-camera"
                class="lo-button">
                💾 Update Camera
            </button>

        </div>
    `;

        const title = document.getElementById("lo-hotspot-title");

        title.oninput = () => {

            const hotspot = this.lo.selectedHotspot;

            if (!hotspot) {
                return;
            }

            hotspot.title = title.value;

            const element =
                document.getElementById(
                    `lo-hotspot-${hotspot.id}`
                );

            const label =
                element?.querySelector(".lo-hotspot-label");

            if (label) {
                label.textContent = hotspot.title;
            }

            this.refreshHotspotList();
        };

        title.onfocus = () => {
        };

        title.onblur = () => {
        };

        const hotspotColor =
            document.getElementById("lo-hotspot-color");

        hotspotColor.oninput = () => {

            const hotspot = this.lo.selectedHotspot;

            if (!hotspot) {
                return;
            }

            hotspot.color = hotspotColor.value;

            const element =
                document.getElementById(
                    `lo-hotspot-${hotspot.id}`
                );

            const marker =
                element?.querySelector(".lo-hotspot-dot");

            if (marker) {
                marker.style.background = hotspot.color;
            }
        };

        const description = document.getElementById("lo-hotspot-description");

        description.oninput = () => {
            this.lo.selectedHotspot.description = description.value;
        };

        description.onfocus = () => {
        };

        description.onblur = () => {
        };

        document
            .getElementById("lo-goto-camera")
            .onclick = () => {

                const hotspot = this.lo.selectedHotspot;

                if (!hotspot) {
                    return;
                }

                this.lo.goToCamera(hotspot.cameraId);

            };

        document
            .getElementById("lo-update-camera")
            .onclick = () => {

                this.lo.updateSelectedHotspotCamera();

            };
    }

    showToast(text) {

        const toast = document.getElementById("lo-toast");

        if (!toast) {
            return;
        }

        toast.textContent = text;

        toast.classList.add("visible");

        clearTimeout(this.toastTimer);

        this.toastTimer = setTimeout(() => {

            toast.classList.remove("visible");

        }, 2000);
    }
}

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

    captureCamera() {
        return this.cameraManager.capture();
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

    saveCamera(name) {
        return this.cameraManager.save(name);
    },

    goToCamera(name) {
        return this.cameraManager.goTo(name);
    },

    updateSelectedHotspotCamera() {
        return this.cameraManager.updateSelected();
    },

    listCameras() {
        return this.cameraManager.list();
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

        const camera = this.captureCamera();

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