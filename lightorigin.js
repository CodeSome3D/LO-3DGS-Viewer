import { LOCamera } from "./js/LOCamera.js";
import { HotspotManager } from "./js/HotspotManager.js";
import { CameraManager } from "./js/CameraManager.js";


    
class TourManager {

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

class TourUIManager {

    constructor(lo) {
        this.lo = lo;
    }

    create() {

        if (document.getElementById("lo-tour-card")) {
            return;
        }

        const card =
            document.createElement("div");

        card.id = "lo-tour-card";

        const title =
            document.createElement("div");

        title.id = "lo-tour-title";

        const description =
            document.createElement("div");

        description.id = "lo-tour-description";

        const controls =
            document.createElement("div");

        controls.id = "lo-tour-controls";

        const previous =
            document.createElement("button");

        previous.id = "lo-tour-previous";
        previous.className = "lo-tour-button";
        previous.textContent = "‹";

        const counter =
            document.createElement("div");

        counter.id = "lo-tour-counter";
        counter.textContent = "0 / 0";

        const next =
            document.createElement("button");

        next.id = "lo-tour-next";
        next.className = "lo-tour-button";
        next.textContent = "›";

        controls.append(
            previous,
            counter,
            next
        );

        card.append(
            title,
            description,
            controls
        );

        document.body.appendChild(card);

        previous.onclick = e => {

            e.stopPropagation();

            this.lo.tourManager.previous();
        };

        next.onclick = e => {

            e.stopPropagation();

            this.lo.tourManager.next();
        };
    }

    update(hotspot) {

        const card =
            document.getElementById("lo-tour-card");

        const title =
            document.getElementById("lo-tour-title");

        const description =
            document.getElementById(
                "lo-tour-description"
            );

        const counter =
            document.getElementById(
                "lo-tour-counter"
            );

        if (
            !card ||
            !title ||
            !description
        ) {
            return;
        }

        if (!hotspot) {

            card.classList.remove("visible");

            return;
        }

        const index =
            this.lo.hotspots.indexOf(hotspot);

        if (counter && index !== -1) {

            counter.textContent =
                `${index + 1} / ${this.lo.hotspots.length}`;
        }

        card.classList.remove("visible");

        setTimeout(() => {

            title.textContent =
                hotspot.title || "";

            description.textContent =
                hotspot.description || "";

            title.style.display =
                hotspot.title?.trim()
                    ? ""
                    : "none";

            description.style.display =
                hotspot.description?.trim()
                    ? ""
                    : "none";

            card.classList.add("visible");

        }, 300);
    }
}

class Serializer {
    constructor(lo) {
        this.lo = lo;
    }

    export(project) {
        return JSON.stringify(project, null, 2);
    }

    import(json) {
        return JSON.parse(json);
    }

}

class ProjectManager {

    constructor(lo) {
        this.lo = lo;
    }

    export() {

        const hotspots =
            this.lo.hotspots.map(hotspot => ({

                id: hotspot.id,

                title: hotspot.title,

                description: hotspot.description,

                color: hotspot.color,

                position: {
                    ...hotspot.position
                },

                cameraId: hotspot.cameraId

            }));

        return this.lo.serializer.export({

            project: this.lo.projectcard,

            cameras: this.lo.cameras,

            hotspots

        });
    }

    import(json) {

        const project =
            this.lo.serializer.import(json);

        this.lo.projectcard = project.project ?? {

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

        };

        this.lo.projectcard.autospinOnLoad ??= false;

        this.lo.projectcard.background ??= {

            type: "color",

            color: "#2a2a2a"

        };

        this.lo.projectcard.background.gradient ??= {

            mode: "linear",

            angle: 135,

            colors: [

                "#202020",

                "#606060"

            ]

        };

        this.lo.projectcard.background ??= {

            type: "color",

            color: "#2a2a2a"

        };

        this.lo.projectcard.background.gradient ??= {

            mode: "linear",

            angle: 135,

            colors: [

                "#202020",

                "#606060"

            ]

        };

        this.lo.projectcard.background.image ??= {

            url: "",

            fit: "cover"

        };

        this.lo.projectcard.background.panorama ??= {

            url: ""

        };

        this.lo.cameras = project.cameras ?? {};

        this.lo.hotspots = project.hotspots ?? [];

        this.lo.selectedHotspot = null;

        this.applyBackground();

        this.lo.renderHotspots();

        if (this.lo.isEditor()) {

            this.lo.uiManager?.refresh();
        }
    }

    save(filename = null) {

        const blob = new Blob(

            [this.export()],

            {

                type: "application/json"

            }

        );

        const a = document.createElement("a");

        a.href = URL.createObjectURL(blob);

        a.download =

            filename ||

            `${this.lo.projectcard.name}.lo.json`;

        a.click();

        URL.revokeObjectURL(a.href);
    }

    load(file) {

        const reader = new FileReader();

        reader.onload = () =>

            this.import(reader.result);

        reader.readAsText(file);
    }

    async loadFromURL(url) {

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Failed to load project: ${response.status}`
            );
        }

        const json =
            await response.text();

        this.import(json);
    }

    setName(name) {

        this.lo.projectcard.name = name;
    }

    applyBackground() {

        switch (this.lo.projectcard.background.type) {

            case "transparent":

                this.applyTransparent();

                break;

            case "color":

                this.applyColor();

                break;

            case "gradient":

                this.applyGradient();

                break;

            case "image":

                this.applyImage();

                break;

            case "panorama":

                this.applyPanorama();

                break;
        }
    }

    applyColor() {

        const background =
            document.getElementById(
                "lo-background"
            );

        if (background) {

            background.style.display =
                "none";
        }

        const gradient =
            document.getElementById(
                "lo-gradient-background"
            );

        if (gradient) {

            gradient.style.display =
                "none";
        }

        const bg =
            this.lo.projectcard.background;

        const cam =
            this.lo.getPCCamera();

        const color =
            bg.color.replace("#","");

        cam.clearColor.set(

            parseInt(color.slice(0,2),16)/255,

            parseInt(color.slice(2,4),16)/255,

            parseInt(color.slice(4,6),16)/255,

            1

        );

        this.lo.viewer.global.app.renderNextFrame = true;
    }

    applyTransparent() {

        const background =
            document.getElementById(
                "lo-background"
            );

        if (background) {

            background.style.display =
                "none";
        }
        const gradient =
            document.getElementById(
                "lo-gradient-background"
            );

        if (gradient) {

            gradient.style.display =
                "none";
        }

        const cam =
            this.lo.getPCCamera();

        cam.clearColor.set(
            0,0,0,0
        );

        this.lo.viewer.global.app.renderNextFrame = true;
    }

    applyGradient() {

        const bg =
            this.lo.projectcard.background;

        const app =
            this.lo.viewer.global.app;

        const canvas =
            app.graphicsDevice.canvas;

        let background =
            document.getElementById(
                "lo-background"
            );

        if (!background) {

            background =
                document.createElement("div");

            background.id =
                "lo-background";

            canvas.parentNode.insertBefore(
                background,
                canvas
            );
        }

        const g =
            bg.gradient;

            background.style.backgroundImage = "";
            background.style.background =

            g.mode === "radial"

            ? `radial-gradient(circle,
                ${g.colors.join(",")})`

            : `linear-gradient(
                ${g.angle}deg,
                ${g.colors.join(",")}
            )`;

        background.style.display =
            "block";

        this.lo.getPCCamera().clearColor
            .set(0,0,0,0);

        app.renderNextFrame = true;
    }

    applyImage() {

        const bg =
            this.lo.projectcard.background;

        const app =
            this.lo.viewer.global.app;

        const canvas =
            app.graphicsDevice.canvas;

        let background =
            document.getElementById(
                "lo-background"
            );

        if (!background) {

            background =
                document.createElement("div");

            background.id =
                "lo-background";

            canvas.parentNode.insertBefore(
                background,
                canvas
            );
        }

        background.style.display =
            "block";

        background.style.background =
            "none";

        background.style.backgroundImage =
            `url("${bg.image.url}")`;

        background.style.backgroundRepeat =
            "no-repeat";

        background.style.backgroundPosition =
            "center";

        background.style.backgroundSize =
            bg.image.fit;

        this.lo.getPCCamera()
            .clearColor.set(
                0,0,0,0
            );

        app.renderNextFrame = true;
    }

    applyPanorama() {

    }

    setBackgroundColor(color) {

        this.lo.projectcard.background.type =

            "color";

        this.lo.projectcard.background.color =

            color;

        this.applyBackground();
    }

    setBackgroundGradient(mode, angle, colors) {

        const bg =
            this.lo.projectcard.background;

        bg.gradient ??= {

            mode: "linear",

            angle: 135,

            colors: [

                "#202020",

                "#606060"

            ]

        };

        bg.type = "gradient";

        bg.gradient.mode = mode;

        bg.gradient.angle = angle;

        bg.gradient.colors = [...colors];

        this.applyBackground();
    }

    setTransparentBackground() {

        this.lo.projectcard.background.type =

            "transparent";

        this.applyBackground();
    }

}

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

class PickingManager {

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