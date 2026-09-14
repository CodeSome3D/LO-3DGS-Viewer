import { IconLibrary } from "./IconLibrary.js";

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

                        <label class="lo-checkbox-row" style="margin-top: 4px;">

                            <input
                                id="lo-tour-autoplay-on-load"
                                type="checkbox">

                            <span>Autoplay tour on load</span>

                        </label>

                        <div class="lo-section" style="margin-top: 8px;">

                            <div class="lo-section-title">Tour Step Duration</div>

                            <select id="lo-tour-dwell-time" class="lo-select">
                                <option value="3000">3 Seconds</option>
                                <option value="5000">5 Seconds (Default)</option>
                                <option value="8000">8 Seconds</option>
                                <option value="10000">10 Seconds</option>
                                <option value="15000">15 Seconds</option>
                            </select>

                        </div>

                        <button
                            id="lo-set-initial-view"
                            class="lo-button"
                            style="margin-top: 10px;">

                            Set Initial View

                        </button>

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

                            <button
                                id="lo-bg-panorama-select"
                                class="lo-button">

                                Select Panorama

                            </button>

                            <div id="lo-bg-panorama-name">

                                No panorama selected

                            </div>

                            <label for="lo-bg-panorama-rotation">
                                Rotation:
                                <span id="lo-bg-panorama-rotation-value">0°</span>
                            </label>

                            <input
                                id="lo-bg-panorama-rotation"
                                type="range"
                                min="-180"
                                max="180"
                                step="1"
                                value="0">

                        </div>

                        <div class="lo-section">

                            <div class="lo-section-title">3DGS Model</div>

                            <div class="lo-toolbar">

                                <button
                                    id="lo-upload-gsplat"
                                    class="lo-button lo-toolbar-button"
                                    title="Upload a .sog or .ply 3DGS file">
                                    ⬆ Upload 3DGS
                                </button>

                                <button
                                    id="lo-delete-gsplat"
                                    class="lo-button lo-toolbar-button lo-button-danger"
                                    title="Remove the current 3DGS model">
                                    🗑 Delete 3DGS
                                </button>

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

                        <button
                            id="lo-share-embed"
                            class="lo-button"
                            style="background: rgba(34, 199, 184, 0.15); border-color: var(--lo-accent, #22C7B8); color: #fff;">
                            🔗 Share & Embed Tour
                        </button>

                        <button
                            id="lo-export-standalone-zip"
                            class="lo-button">
                            📦 Export Standalone (.zip)
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
                            + Add Hotspot
                        </button>

                    </div>

                <div id="lo-hotspot-list"></div>
            </div>

            <div class="lo-section">
                <h2>Portals 🌀</h2>

                    <div class="lo-toolbar">

                        <button
                            id="lo-add-portal"
                            class="lo-button lo-toolbar-button">
                            + Add Portal
                        </button>

                    </div>

                <div id="lo-portal-list"></div>
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

        const uploadGsplatBtn = document.getElementById("lo-upload-gsplat");
        if (uploadGsplatBtn) {
            uploadGsplatBtn.onclick = () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".sog,.ply";
                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    this.showToast("Loading 3DGS model...");
                    try {
                        await this.lo.loadGsplat(file, (p) => {
                            if (p < 100) {
                                this.showToast(`Loading 3DGS: ${p}%`);
                            }
                        });
                        this.showToast("✓ 3DGS loaded successfully");
                    } catch (err) {
                        this.showToast("❌ Failed to load 3DGS model");
                    }
                };
                input.click();
            };
        }

        const deleteGsplatBtn = document.getElementById("lo-delete-gsplat");
        if (deleteGsplatBtn) {
            deleteGsplatBtn.onclick = () => {
                this.lo.unloadGsplat();
                this.showToast("3DGS model removed");
            };
        }

        const addButton = document.getElementById("lo-add-hotspot");
        const addPortalBtn = document.getElementById("lo-add-portal");

        if (addButton) {
            addButton.onclick = () => {
                this.lo.waitingForHotspotPick = "hotspot";
                addPortalBtn?.classList.remove("active");
                addButton.classList.add("active");
                this.lo.canvas.style.cursor = "crosshair";
                this.showToast("Click the model to place a hotspot.");
            };
        }

        if (addPortalBtn) {
            addPortalBtn.onclick = () => {
                this.lo.waitingForHotspotPick = "portal";
                addButton?.classList.remove("active");
                addPortalBtn.classList.add("active");
                this.lo.canvas.style.cursor = "crosshair";
                this.showToast("Click the model to place a portal 🌀.");
            };
        }

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
        const tourAutoplay = document.getElementById("lo-tour-autoplay-on-load");
        const tourDwellTime = document.getElementById("lo-tour-dwell-time");

        if (autospin) {
            autospin.onchange = () => {
                this.lo.projectcard.autospinOnLoad = autospin.checked;
            };
        }

        if (tourAutoplay) {
            tourAutoplay.onchange = () => {
                this.lo.projectcard.tourAutoplayOnLoad = tourAutoplay.checked;
            };
        }

        if (tourDwellTime) {
            tourDwellTime.onchange = () => {
                this.lo.projectcard.tourDwellTime = parseInt(tourDwellTime.value, 10);
            };
        }

        const setInitialViewBtn = document.getElementById("lo-set-initial-view");
        if (setInitialViewBtn) {
            setInitialViewBtn.onclick = () => {
                if (this.lo.cameraManager) {
                    this.lo.cameras["camera-0"] = this.lo.cameraManager.capture();
                    this.lo.uiManager?.showToast("✓ Initial view set");
                }
            };
        }

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

        const shareEmbedBtn = document.getElementById("lo-share-embed");
        if (shareEmbedBtn) {
            shareEmbedBtn.onclick = () => {
                this.lo.embedManager?.openModal();
            };
        }

        const exportZipBtn = document.getElementById("lo-export-standalone-zip");
        if (exportZipBtn) {
            exportZipBtn.onclick = () => {
                this.lo.exportManager?.exportStandaloneZip();
            };
        }

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

                    if (this.lo.projectcard.background.image.url !== "") {

                        this.lo.projectcard.background.type = "image";
                        this.lo.projectManager.applyBackground();

                    }

                    break;

                case "panorama":

                    if (this.lo.projectcard.background.panorama.url !== "") {

                        this.lo.projectcard.background.type = "panorama";
                        this.lo.projectManager.applyBackground();

                    }

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

            const panoramaButton =
                document.getElementById("lo-bg-panorama-select");

            const panoramaName =
                document.getElementById("lo-bg-panorama-name");

            const panoramaRotation =
                document.getElementById("lo-bg-panorama-rotation");

            const panoramaRotationValue =
                document.getElementById("lo-bg-panorama-rotation-value");

            panoramaButton.onclick = () => {

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
                        .background.panorama.file = file;

                    panoramaName.textContent =
                        file.name;

                    this.lo.projectcard
                        .background.type = "panorama";

                    this.lo.projectcard
                        .background.panorama.url =
                            "assets/" + file.name;

                    this.lo.projectManager
                        .applyBackground();

                };

                input.click();
            };

            panoramaRotation.oninput = () => {

                const rotation = Number(panoramaRotation.value);

                panoramaRotationValue.textContent = `${rotation}°`;

                this.lo.projectcard.background.panorama.rotation = rotation;

                this.lo.viewer.setSkyboxRotation(rotation);
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
        const tourAutoplay = document.getElementById("lo-tour-autoplay-on-load");
        const tourDwellTime = document.getElementById("lo-tour-dwell-time");

        if (autospin) {
            autospin.checked =
                this.lo.projectcard.autospinOnLoad
                ?? false;
        }

        if (tourAutoplay) {
            tourAutoplay.checked =
                this.lo.projectcard.tourAutoplayOnLoad
                ?? false;
        }

        if (tourDwellTime) {
            tourDwellTime.value =
                String(this.lo.projectcard.tourDwellTime || 5000);
        }
        theme.value = this.lo.projectcard.theme || "dark";
        this.lo.setTheme(this.lo.projectcard.theme || "dark");

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

        const panoramaRotation =
            document.getElementById("lo-bg-panorama-rotation");

        const panoramaRotationValue =
            document.getElementById("lo-bg-panorama-rotation-value");

        if (panoramaRotation && panoramaRotationValue) {

            panoramaRotation.value = bg.panorama.rotation ?? 0;

            panoramaRotationValue.textContent =
                `${bg.panorama.rotation ?? 0}°`;
        }

    }

    refreshHotspotList() {

        const hotspotList =
            document.getElementById("lo-hotspot-list");

        const portalList =
            document.getElementById("lo-portal-list");

        const updateCameraButton =
            document.getElementById("lo-update-camera");

        if (updateCameraButton) {

            updateCameraButton.disabled =
                !this.lo.selectedHotspot;
        }

        if (hotspotList) hotspotList.innerHTML = "";
        if (portalList) portalList.innerHTML = "";

        const renderItem = (hotspot, container, isPortal) => {

            const row =
                document.createElement("div");

            row.className = "lo-hotspot-row";

            if (hotspot === this.lo.selectedHotspot) {

                row.classList.add("selected");
            }

            const title =
                document.createElement("span");

            title.textContent =
                isPortal
                    ? `🌀 ${hotspot.title || "(Untitled Portal)"}`
                    : (hotspot.title || "(Untitled)");

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

            container.appendChild(row);
        };

        const regularHotspots = this.lo.hotspots.filter(h => h.type !== "portal");
        const portals = this.lo.hotspots.filter(h => h.type === "portal");

        if (hotspotList) {
            if (regularHotspots.length === 0) {
                hotspotList.innerHTML = `<div class="lo-empty-state" style="padding: 8px 0; font-size: 12px;">No hotspots added</div>`;
            } else {
                for (const hotspot of regularHotspots) {
                    renderItem(hotspot, hotspotList, false);
                }
            }
        }

        if (portalList) {
            if (portals.length === 0) {
                portalList.innerHTML = `<div class="lo-empty-state" style="padding: 8px 0; font-size: 12px;">No portals added</div>`;
            } else {
                for (const portal of portals) {
                    renderItem(portal, portalList, true);
                }
            }
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

        const activeIcon = this.lo.selectedHotspot.icon || (this.lo.selectedHotspot.type === "portal" ? "portal" : "default");
        const availableIcons = IconLibrary.getAvailablePresets(this.lo.selectedHotspot.type);

        let iconGridHtml = `<div class="lo-icon-grid">`;
        for (const iconKey of availableIcons) {
            const preset = IconLibrary.presets[iconKey];
            const isSelected = activeIcon === iconKey;
            let iconInner = preset.svg || (preset.glyph ? `<span class="lo-icon-glyph">${preset.glyph}</span>` : `<div style="width:8px;height:8px;border-radius:50%;background:currentColor;"></div>`);
            iconGridHtml += `
                <button type="button" class="lo-icon-btn ${isSelected ? 'selected' : ''}" data-icon="${iconKey}" title="${preset.label}">
                    ${iconInner}
                </button>
            `;
        }
        iconGridHtml += `</div>`;

    properties.innerHTML = `
        <div class="lo-property-card">
            
            <div class="lo-section-title">
                Type
            </div>
            
            <select id="lo-hotspot-type" style="width: 100%; margin-bottom: 12px;">
                <option value="hotspot" ${this.lo.selectedHotspot.type !== "portal" ? "selected" : ""}>Hotspot</option>
                <option value="portal" ${this.lo.selectedHotspot.type === "portal" ? "selected" : ""}>Portal</option>
            </select>

            <div class="lo-section-title">
                Icon
            </div>

            ${iconGridHtml}

            ${activeIcon === "custom" ? `
                <div id="lo-custom-icon-row" style="margin-bottom: 12px;">
                    <label style="font-size: 11px; opacity: 0.8; margin-bottom: 4px; display: block;">Custom SVG / Emoji / Text</label>
                    <input id="lo-hotspot-custom-svg" type="text" placeholder="e.g. 💎 or <svg>...</svg>" value="${(this.lo.selectedHotspot.customSvg || '').replace(/"/g, '&quot;')}" style="width: 100%;">
                </div>
            ` : ""}

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
                    value="${this.lo.selectedHotspot.color || (this.lo.selectedHotspot.type === 'portal' ? '#00e5ff' : '#ff7a00')}">

            </div>

            ${this.lo.selectedHotspot.type === "portal" ? `
                <div class="lo-section-title">
                    Target Project URL
                </div>

                <input
                    id="lo-hotspot-target-url"
                    type="text"
                    placeholder="./projects/other/other.lo.json"
                    value="${this.lo.selectedHotspot.targetUrl || ""}"
                    style="width: 100%; margin-bottom: 12px;">
            ` : `
                <div class="lo-section-title">
                    Description
                </div>

                <textarea
                    id="lo-hotspot-description"
                    rows="4">${this.lo.selectedHotspot.description || ""}</textarea>

                <div style="font-size: 11px; opacity: 0.65; margin-top: 4px; margin-bottom: 12px; line-height: 1.4;">
                    Supports markdown: <strong>**bold**</strong>, <em>*italic*</em>, <span style="color:#00e5ff;">[links](url)</span>, <code># heading</code>
                </div>

                <div class="lo-section-title">
                    Media Attachment
                </div>

                <select id="lo-hotspot-media-type" style="width: 100%; margin-bottom: 8px;">
                    <option value="none" ${(!this.lo.selectedHotspot.mediaType || this.lo.selectedHotspot.mediaType === "none") ? "selected" : ""}>None</option>
                    <option value="image" ${this.lo.selectedHotspot.mediaType === "image" ? "selected" : ""}>Image (URL)</option>
                    <option value="video" ${this.lo.selectedHotspot.mediaType === "video" ? "selected" : ""}>Video (YouTube / Vimeo / MP4)</option>
                    <option value="audio" ${this.lo.selectedHotspot.mediaType === "audio" ? "selected" : ""}>Audio (MP3 / WAV)</option>
                </select>

                <div id="lo-hotspot-media-url-container" style="display: ${(!this.lo.selectedHotspot.mediaType || this.lo.selectedHotspot.mediaType === "none") ? "none" : "block"}; margin-bottom: 12px;">
                    <input
                        id="lo-hotspot-media-url"
                        type="text"
                        placeholder="https://... or YouTube / Vimeo URL"
                        value="${(this.lo.selectedHotspot.mediaUrl || '').replace(/"/g, '&quot;')}"
                        style="width: 100%;">
                </div>

                <div class="lo-section-title">
                    Action Button (CTA)
                </div>

                <div style="margin-bottom: 6px;">
                    <input
                        id="lo-hotspot-cta-label"
                        type="text"
                        placeholder="Button Text (e.g. Learn More)"
                        value="${(this.lo.selectedHotspot.actionButton?.label || '').replace(/"/g, '&quot;')}"
                        style="width: 100%; margin-bottom: 6px;">
                    
                    <input
                        id="lo-hotspot-cta-url"
                        type="text"
                        placeholder="Button Link URL (https://...)"
                        value="${(this.lo.selectedHotspot.actionButton?.url || '').replace(/"/g, '&quot;')}"
                        style="width: 100%; margin-bottom: 12px;">
                </div>
            `}

            <div class="lo-section-title">
                Information
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

        properties.querySelectorAll(".lo-icon-btn").forEach(btn => {
            btn.onclick = () => {
                const iconKey = btn.dataset.icon;
                const hotspot = this.lo.selectedHotspot;
                if (!hotspot) return;
                hotspot.icon = iconKey;
                this.refreshProperties();
                this.lo.renderHotspots();
            };
        });

        const customSvg = document.getElementById("lo-hotspot-custom-svg");
        if (customSvg) {
            customSvg.oninput = () => {
                const hotspot = this.lo.selectedHotspot;
                if (!hotspot) return;
                let val = customSvg.value;
                if (val && !val.trim().startsWith("<svg") && !val.trim().startsWith("<?xml")) {
                    const symbols = Array.from(val).slice(0, 3).join("");
                    if (symbols !== val) {
                        val = symbols;
                        customSvg.value = val;
                    }
                }
                hotspot.customSvg = val;
                this.lo.renderHotspots();
            };
        }

        const type = document.getElementById("lo-hotspot-type");
        if (type) {
            type.onchange = () => {
                const hotspot = this.lo.selectedHotspot;
                if (!hotspot) return;
                hotspot.type = type.value;
                if (hotspot.type === "portal" && !hotspot.color) {
                    hotspot.color = "#00e5ff"; // Default portal color
                }
                if (hotspot.type === "portal" && (!hotspot.icon || hotspot.icon === "default")) {
                    hotspot.icon = "portal";
                } else if (hotspot.type !== "portal" && hotspot.icon === "portal") {
                    hotspot.icon = "default";
                }
                this.refreshProperties();
                this.refreshHotspotList();
                this.lo.renderHotspots(); // Re-render to apply portal classes
            };
        }

        const targetUrl = document.getElementById("lo-hotspot-target-url");
        if (targetUrl) {
            targetUrl.oninput = () => {
                const hotspot = this.lo.selectedHotspot;
                if (!hotspot) return;
                hotspot.targetUrl = targetUrl.value.replace(/\\/g, '/');
            };
        }

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
        if (description) {
            description.oninput = () => {
                if (this.lo.selectedHotspot) {
                    this.lo.selectedHotspot.description = description.value;
                }
            };
        }

        const mediaType = document.getElementById("lo-hotspot-media-type");
        const mediaUrl = document.getElementById("lo-hotspot-media-url");
        const mediaUrlContainer = document.getElementById("lo-hotspot-media-url-container");

        if (mediaType) {
            mediaType.onchange = () => {
                if (!this.lo.selectedHotspot) return;
                this.lo.selectedHotspot.mediaType = mediaType.value;
                if (mediaUrlContainer) {
                    mediaUrlContainer.style.display = mediaType.value === "none" ? "none" : "block";
                }
            };
        }

        if (mediaUrl) {
            mediaUrl.oninput = () => {
                if (!this.lo.selectedHotspot) return;
                this.lo.selectedHotspot.mediaUrl = mediaUrl.value.trim();
            };
        }

        const ctaLabel = document.getElementById("lo-hotspot-cta-label");
        const ctaUrl = document.getElementById("lo-hotspot-cta-url");

        if (ctaLabel) {
            ctaLabel.oninput = () => {
                if (!this.lo.selectedHotspot) return;
                this.lo.selectedHotspot.actionButton ??= { label: "", url: "" };
                this.lo.selectedHotspot.actionButton.label = ctaLabel.value;
            };
        }

        if (ctaUrl) {
            ctaUrl.oninput = () => {
                if (!this.lo.selectedHotspot) return;
                this.lo.selectedHotspot.actionButton ??= { label: "", url: "" };
                this.lo.selectedHotspot.actionButton.url = ctaUrl.value.trim();
            };
        }

        const gotoCam = document.getElementById("lo-goto-camera");
        if (gotoCam) {
            gotoCam.onclick = () => {
                const hotspot = this.lo.selectedHotspot;
                if (!hotspot) {
                    return;
                }
                this.lo.cameraManager.goTo(hotspot.cameraId);
            };
        }

        const updateCam = document.getElementById("lo-update-camera");
        if (updateCam) {
            updateCam.onclick = () => {
                this.lo.updateSelectedHotspotCamera();
            };
        }
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