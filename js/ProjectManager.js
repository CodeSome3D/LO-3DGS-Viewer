export class ProjectManager {

    constructor(lo) {
        this.lo = lo;
    }

    export() {

        // Auto-detect current active scene/model if not set or placeholder
        if (!this.lo.projectcard.scene ||
            this.lo.projectcard.scene === "./scene.sog" ||
            this.lo.projectcard.scene === "scene.sog") {
            const gsplatAsset = this.lo.viewer?.global?.app?.assets?.find(a => a.type === 'gsplat');
            if (gsplatAsset) {
                const assetUrl = gsplatAsset.file?.url || gsplatAsset.name;
                if (assetUrl && !assetUrl.startsWith('blob:')) {
                    this.lo.projectcard.scene = assetUrl;
                } else if (gsplatAsset.name && !gsplatAsset.name.startsWith('blob:')) {
                    this.lo.projectcard.scene = gsplatAsset.name;
                }
            }
        }

        const hotspots =
            this.lo.hotspots.map(hotspot => ({

                id: hotspot.id,

                title: hotspot.title,

                description: hotspot.description,

                color: hotspot.color,
                
                type: hotspot.type || "hotspot",
                
                targetUrl: hotspot.targetUrl || "",

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

    async import(json, sourceContext = null) {

        const project =
            this.lo.serializer.import(json);

        this.lo.projectcard = project.project ?? {

            name: "Untitled Project",

            version: 2,

            scene: "./scene.sog",

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

        };

        this.lo.projectcard.autospinOnLoad ??= false;

        this.lo.projectcard.scene ??= "./scene.sog";

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

            url: "",
            rotation: 0

        };

        this.lo.projectcard.background.panorama.rotation ??= 0;

        // Remove hotspot elements from the previous project
        for (const hotspot of this.lo.hotspots) {
            hotspot.element?.remove();
            hotspot.element = null;
        }

        this.lo.cameras = project.cameras ?? {};
        this.lo.hotspots = project.hotspots ?? [];

        // Migrate any hotspot that uses "camera-0" to a new ID, to reserve "camera-0" strictly for initial view
        const hasCamera0Hotspot = this.lo.hotspots.some(h => h.cameraId === "camera-0");
        if (hasCamera0Hotspot) {
            let newId = 1;
            while (this.lo.cameras[`camera-${newId}`]) {
                newId++;
            }
            const newCamId = `camera-${newId}`;
            this.lo.cameras[newCamId] = JSON.parse(JSON.stringify(this.lo.cameras["camera-0"]));
            
            for (const hotspot of this.lo.hotspots) {
                if (hotspot.cameraId === "camera-0") {
                    hotspot.cameraId = newCamId;
                }
            }
        }

        // Update camera counter to avoid overwriting existing cameras
        let maxIndex = 0;
        for (const key of Object.keys(this.lo.cameras)) {
            if (key.startsWith("camera-")) {
                const idx = parseInt(key.replace("camera-", ""), 10);
                if (!isNaN(idx) && idx > maxIndex) {
                    maxIndex = idx;
                }
            }
        }
        this.lo.cameraCounter = Math.max(1, maxIndex + 1);

        this.lo.selectedHotspot = null;

        this.applyBackground();

        this.lo.renderHotspots();

        // Determine candidates for 3DGS model loading
        const candidates = [];

        const normalizePath = (p) => {
            if (!p || typeof p !== "string") return "";
            return p.replace(/\\/g, '/').replace(/^\/+/, '').replace(/^\.\/+/, '').trim();
        };

        // 1. From projectcard.scene (the authoritative scene path saved in the project)
        const scenePath = this.lo.projectcard.scene;
        if (scenePath && typeof scenePath === "string" && !scenePath.startsWith("blob:")) {
            const cleanScene = normalizePath(scenePath);
            if (cleanScene && cleanScene !== "scene.sog" && cleanScene !== "scene.ply") {
                candidates.push(`./${cleanScene}`);
                candidates.push(cleanScene);
            }
        }

        // 2. From sourceContext (the path or file from which project json was loaded)
        if (typeof sourceContext === "string" && !sourceContext.startsWith("blob:") && !sourceContext.startsWith("data:")) {
            const cleanCtx = normalizePath(sourceContext);
            const parts = cleanCtx.split('/');
            const filename = parts.pop() || "";
            const fileId = filename.replace(/\.lo\.json$|\.json$/, '');
            const folderName = parts.length > 0 ? parts[parts.length - 1] : "";

            if (folderName && folderName !== 'projects') {
                candidates.push(`./projects/${folderName}/${folderName}.sog`);
                candidates.push(`./projects/${folderName}/${folderName}.ply`);
                candidates.push(`./projects/${folderName}/${fileId}.sog`);
                candidates.push(`./projects/${folderName}/${fileId}.ply`);
                candidates.push(`./projects/${folderName}/scene.sog`);
            }
            if (fileId) {
                candidates.push(`./projects/${fileId}/${fileId}.sog`);
                candidates.push(`./projects/${fileId}/${fileId}.ply`);
                candidates.push(`./projects/${fileId}/scene.sog`);
                candidates.push(`./${fileId}.sog`);
                candidates.push(`./${fileId}.ply`);
            }
        } else if (sourceContext && typeof sourceContext === "object" && sourceContext.name) {
            const filename = sourceContext.name.replace(/\\/g, '/').split('/').pop() || "";
            const fileId = filename.replace(/\.lo\.json$|\.json$/, '');
            if (fileId) {
                candidates.push(`./projects/${fileId}/${fileId}.sog`);
                candidates.push(`./projects/${fileId}/${fileId}.ply`);
                candidates.push(`./projects/${fileId}/scene.sog`);
            }
        }

        // 3. Fallback to project name
        const projName = (this.lo.projectcard.name || "").toLowerCase();
        if (projName.includes("three") || projName.includes("museum")) {
            candidates.push("./projects/00_3_figures/00_3_figures.sog");
        } else if (projName.includes("cactus") || projName.includes("kaktus")) {
            candidates.push("./projects/01_cactus/01_cactus.sog");
            candidates.push("./projects/02_kaktus/02_kaktus.sog");
        } else if (projName.includes("figure")) {
            candidates.push("./projects/03_figure/03_figure.sog");
        }

        // Clean & Deduplicate candidates
        const uniqueCandidates = Array.from(new Set(candidates.filter(Boolean)));
        console.log("[ProjectManager] Splat candidates for project:", uniqueCandidates);

        // Check if an existing 3DGS model was already present in the scene
        const existingEntities = this.lo.viewer?.global?.app?.root?.find((node) => node.name === 'gsplat') || [];
        const hasExistingModel = existingEntities.length > 0;
        const currentLoaded = this.lo.currentLoadedSplatUrl || this.lo.viewer?.global?.config?.contentUrl;

        let loadedSplat = false;

        const normalizeSplatUrl = (u) => {
            if (!u) return "";
            return String(u).replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\//, '').toLowerCase();
        };

        const currentNorm = normalizeSplatUrl(currentLoaded);
        const primaryTargetNorm = uniqueCandidates.length > 0 ? normalizeSplatUrl(uniqueCandidates[0]) : "";

        // Only skip if the first/primary valid candidate is already the active model
        if (hasExistingModel && currentNorm && primaryTargetNorm && currentNorm === primaryTargetNorm) {
            console.log(`[ProjectManager] Splat model already active: ${currentLoaded}`);
            loadedSplat = true;
        }

        if (!loadedSplat) {
            for (const candidate of uniqueCandidates) {
                try {
                    console.log(`[ProjectManager] Trying splat candidate: ${candidate}`);
                    const res = await this.lo.loadGsplat(candidate);
                    if (res) {
                        loadedSplat = true;
                        this.lo.currentLoadedSplatUrl = candidate;
                        if (this.lo.isEditor()) {
                            this.lo.uiManager?.showToast("✓ 3DGS loaded successfully");
                        }
                        break;
                    }
                } catch (e) {
                    console.warn(`[ProjectManager] Splat candidate not found: ${candidate}`);
                }
            }
        }

        if (!loadedSplat) {
            if (hasExistingModel) {
                console.warn("[ProjectManager] No valid 3DGS model found for this project, unloading previous model");
                this.lo.unloadGsplat?.();
                this.lo.currentLoadedSplatUrl = null;
            }
            if (this.lo.isEditor()) {
                this.lo.uiManager?.showToast("⚠️ Project loaded. Use 'Upload 3DGS' to attach model.");
            }
        } else if (hasExistingModel && this.lo.isEditor()) {
            this.lo.uiManager?.showToast("✓ Project hotspots and cameras loaded");
        }

        const cameraKeys = Object.keys(this.lo.cameras);
        if (cameraKeys.length > 0) {
            const firstCamKey = cameraKeys.includes("camera-0") ? "camera-0" : cameraKeys[0];
            this.lo.cameraManager?.goTo(firstCamKey, true);
        } else {
            this.lo.cameraManager?.frame();
        }

        this.lo.viewer?.wake?.(5);
        if (this.lo.viewer?.global?.app) {
            this.lo.viewer.global.app.renderNextFrame = true;
        }

        // Re-render hotspots after a short delay to ensure the camera matrix is fully updated
        setTimeout(() => {
            this.lo.renderHotspots();
        }, 100);

        if (this.lo.isViewer()) {
            if (this.lo.setTheme && this.lo.projectcard.theme) {
                this.lo.setTheme(this.lo.projectcard.theme);
            }

            if (this.lo.projectcard.autospinOnLoad) {
                this.lo.cameraManager?.startAutospin();
            } else {
                this.lo.cameraManager?.stopAutospin?.();
            }

            if (this.lo.tourManager) {
                this.lo.tourManager.currentHotspotIndex = -1;
            }
            this.lo.tourUIManager?.update(null);

            if (typeof window !== "undefined" && typeof window.ensureInitialViewButton === "function") {
                window.ensureInitialViewButton();
            }
        }

        if (this.lo.isEditor()) {

            this.lo.uiManager?.refresh();
        }
    }

    extractProjectSlug(rawUrl) {
        if (!rawUrl) return "";
        const clean = String(rawUrl).replace(/\\/g, '/').trim();
        const projMatch = clean.match(/projects\/([^/]+)/);
        if (projMatch) return projMatch[1];
        const file = clean.split('/').pop();
        return file.replace(/\.(lo\.)?json$/i, '');
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

            this.import(reader.result, file);

        reader.readAsText(file);
    }

    async loadFromURL(url, updateUrl = true) {
        if (!url) return;

        let clean = String(url).replace(/\\/g, '/').trim();
        if (clean.startsWith('/')) {
            clean = '.' + clean;
        }

        let fetchUrl = clean;
        if (!fetchUrl.includes('/') && !fetchUrl.endsWith('.json')) {
            fetchUrl = `./projects/${clean}/${clean}.json`;
        } else if (!fetchUrl.startsWith('./') && !fetchUrl.startsWith('http')) {
            fetchUrl = './' + fetchUrl;
        }

        console.log(`[ProjectManager] Loading project from URL: ${fetchUrl}`);

        const response =
            await fetch(fetchUrl);

        if (!response.ok) {

            throw new Error(
                `Failed to load project: ${response.status} from ${fetchUrl}`
            );
        }

        const json =
            await response.text();

        await this.import(json, fetchUrl);

        if (updateUrl && typeof window !== "undefined" && window.location && window.history?.pushState) {
            try {
                const slug = this.extractProjectSlug(fetchUrl);
                if (slug) {
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set("project", slug);
                    window.history.pushState({ project: slug }, "", currentUrl.toString());
                }
            } catch (err) {
                console.warn("[ProjectManager] Could not update address bar:", err);
            }
        }
    }

    setName(name) {

        this.lo.projectcard.name = name;
    }

    applyBackground() {

        this.lo.backgroundManager.apply();

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