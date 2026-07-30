export class ProjectManager {

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