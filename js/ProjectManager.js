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

        // 1. From sourceContext if string or File
        let fileId = null;
        if (typeof sourceContext === "string" && !sourceContext.startsWith("blob:") && !sourceContext.startsWith("data:")) {
            const clean = sourceContext.replace(/\\/g, '/');
            const lastPart = clean.split('/').pop();
            fileId = lastPart.replace(/\.lo\.json$|\.json$/, '');
        } else if (sourceContext && typeof sourceContext === "object" && sourceContext.name) {
            const lastPart = sourceContext.name.replace(/\\/g, '/').split('/').pop();
            fileId = lastPart.replace(/\.lo\.json$|\.json$/, '');
        }

        if (fileId) {
            candidates.push(`./projects/${fileId}/${fileId}.sog`);
            candidates.push(`./projects/${fileId}/scene.sog`);
            candidates.push(`./${fileId}.sog`);
        }

        // 2. From projectcard.scene
        const scenePath = this.lo.projectcard.scene;
        if (scenePath && typeof scenePath === "string" && !scenePath.startsWith("blob:")) {
            if (scenePath !== "./scene.sog" && scenePath !== "scene.sog") {
                candidates.unshift(scenePath);
                const sceneClean = scenePath.replace(/\\/g, '/').split('/').pop();
                const sceneId = sceneClean.replace(/\.sog$|\.ply$/, '');
                if (sceneId && sceneId !== fileId) {
                    candidates.push(`./projects/${sceneId}/${sceneId}.sog`);
                    candidates.push(`./${sceneClean}`);
                }
            } else {
                candidates.push("./scene.sog");
            }
        }

        // 3. Known project aliases (e.g. Three Figures In Museum / museum -> 00_3_figures)
        const projName = (this.lo.projectcard.name || "").toLowerCase();
        const fileIdLower = (fileId || "").toLowerCase();
        if (projName.includes("three") || projName.includes("museum") || fileIdLower.includes("museum") || fileIdLower.includes("three")) {
            candidates.push("./projects/00_3_figures/00_3_figures.sog");
            candidates.push("./index_0.sog");
            candidates.push("./index_1.sog");
        }
        if (projName.includes("cactus") || projName.includes("kaktus") || fileIdLower.includes("cactus") || fileIdLower.includes("kaktus")) {
            candidates.push("./projects/01_cactus/01_cactus.sog");
            candidates.push("./projects/02_kaktus/02_kaktus.sog");
        }

        // Deduplicate candidates
        const uniqueCandidates = Array.from(new Set(candidates.filter(Boolean)));

        // Check if an existing 3DGS model was already present in the scene
        const existingEntities = this.lo.viewer?.global?.app?.root?.find((node) => node.name === 'gsplat') || [];
        const hasExistingModel = existingEntities.length > 0;
        const currentUrl = this.lo.viewer?.global?.config?.contentUrl;

        let loadedSplat = false;

        if (hasExistingModel && currentUrl) {
            const normalizedCurrent = currentUrl.replace(/^\.\//, '');
            if (uniqueCandidates.some(c => c.replace(/^\.\//, '') === normalizedCurrent || currentUrl.endsWith(c.replace(/^\.\//, '')))) {
                console.log(`[ProjectManager] Skipping load, model already active: ${currentUrl}`);
                loadedSplat = true;
            }
        }

        if (!loadedSplat) {
            for (const candidate of uniqueCandidates) {
                try {
                    console.log(`[ProjectManager] Trying splat candidate: ${candidate}`);
                    const res = await this.lo.loadGsplat(candidate);
                    if (res) {
                        loadedSplat = true;
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

        if (!loadedSplat && !hasExistingModel) {
            if (this.lo.isEditor()) {
                this.lo.uiManager?.showToast("⚠️ Project loaded. Use 'Upload 3DGS' to attach model.");
            }
        } else if (!loadedSplat && hasExistingModel) {
            if (this.lo.isEditor()) {
                this.lo.uiManager?.showToast("✓ Project hotspots and cameras loaded");
            }
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

            this.import(reader.result, file);

        reader.readAsText(file);
    }

    async loadFromURL(url) {

        let fetchUrl = url;
        if (!fetchUrl.includes('/') && !fetchUrl.endsWith('.json')) {
            fetchUrl = `./projects/${url}/${url}.json`;
        }

        const response =
            await fetch(fetchUrl);

        if (!response.ok) {

            throw new Error(
                `Failed to load project: ${response.status}`
            );
        }

        const json =
            await response.text();

        await this.import(json, url);
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