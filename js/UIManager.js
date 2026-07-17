export class UIManager {
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
                            <option value="panorama">360° Panorama</option>
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

                        <div id="lo-bg-panorama-settings" style="display:none">

                            <label>Panorama image</label>

                            <input
                                id="lo-bg-panorama-url"
                                class="lo-input"
                                type="text"
                                placeholder="assets/panorama.jpg">

                            <label>Rotation (°)</label>

                            <input
                                id="lo-bg-panorama-rotation"
                                class="lo-input"
                                type="number"
                                value="0">

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

        const panoramaControls =
            document.getElementById("lo-bg-panorama-settings");

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

            panoramaControls.style.display =
                type.value === "panorama"
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
                
                case "panorama":
                    this.lo.projectcard.background.type = "panorama";
                    this.lo.projectManager.applyBackground();
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

            const panoramaURL =
                document.getElementById("lo-bg-panorama-url");

            const panoramaRotation =
                document.getElementById("lo-bg-panorama-rotation");

            panoramaURL.onchange = () => {

                this.lo.projectcard.background.panorama.url =
                    panoramaURL.value;

                this.lo.projectManager.applyBackground();
            };

            panoramaRotation.onchange = () => {

                this.lo.projectcard.background.panorama.rotation =
                    Number(panoramaRotation.value);

                this.lo.projectManager.applyBackground();
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

        const panoramaControls =
            document.getElementById(
                "lo-bg-panorama-settings"
            );

        if (controls) {

            controls.style.display =

                bg.type === "gradient"

                ? "block"

                : "none";
        }

        if (panoramaControls) {

            panoramaControls.style.display =
                bg.type === "panorama"
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

                this.lo.cameraManager.goTo(hotspot.cameraId);

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