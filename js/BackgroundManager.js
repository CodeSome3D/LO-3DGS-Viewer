export class BackgroundManager {

    constructor(lo) {
        this.lo = lo;

        this.panoramaEntity = null;
        this.panoramaMaterial = null;
        this.panoramaTexture = null;
        this.panoramaInitialized = false;
    }

    apply() {

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

                if (this.lo.projectcard.background.image.url.trim() !== "") {
                    this.applyImage();
                }

                break;

            case "panorama":

                if (this.lo.projectcard.background.panorama.url.trim() !== "") {
                    this.applyPanorama();
                }

                break;
        }
    }

    async applyTransparent() {

        await this.lo.viewer.setSkybox(null);

        const background =
            document.getElementById("lo-background");

        if (background)
            background.style.display = "none";

        const gradient =
            document.getElementById("lo-gradient-background");

        if (gradient)
            gradient.style.display = "none";

        this.lo.getPCCamera().clearColor.set(0,0,0,0);

        this.lo.viewer.global.app.renderNextFrame = true;
    }

    async applyColor() {

        await this.lo.viewer.setSkybox(null);

        const background =
            document.getElementById("lo-background");

        if (background)
            background.style.display = "none";

        const gradient =
            document.getElementById("lo-gradient-background");

        if (gradient)
            gradient.style.display = "none";

        const bg = this.lo.projectcard.background;
        const cam = this.lo.getPCCamera();

        const color = bg.color.replace("#","");

        cam.clearColor.set(
            parseInt(color.slice(0,2),16)/255,
            parseInt(color.slice(2,4),16)/255,
            parseInt(color.slice(4,6),16)/255,
            1
        );

        this.lo.viewer.global.app.renderNextFrame = true;
    }

    async applyGradient() {

        await this.lo.viewer.setSkybox(null);

        const bg = this.lo.projectcard.background;
        const app = this.lo.viewer.global.app;
        const canvas = app.graphicsDevice.canvas;

        let background =
            document.getElementById("lo-background");

        if (!background) {

            background = document.createElement("div");
            background.id = "lo-background";

            canvas.parentNode.insertBefore(background, canvas);
        }

        const g = bg.gradient;

        background.style.backgroundImage = "";

        background.style.background =

            g.mode === "radial"

            ? `radial-gradient(circle, ${g.colors.join(",")})`

            : `linear-gradient(${g.angle}deg, ${g.colors.join(",")})`;

        background.style.display = "block";

        this.lo.getPCCamera().clearColor.set(0,0,0,0);

        app.renderNextFrame = true;
    }

    async applyImage() {

        await this.lo.viewer.setSkybox(null);

        const bg = this.lo.projectcard.background;
        const app = this.lo.viewer.global.app;
        const canvas = app.graphicsDevice.canvas;

        let background =
            document.getElementById("lo-background");

        if (!background) {

            background = document.createElement("div");
            background.id = "lo-background";

            canvas.parentNode.insertBefore(background, canvas);
        }

        background.style.display = "block";

        background.style.background = "none";

        background.style.backgroundImage =
            `url("${bg.image.url}")`;

        background.style.backgroundRepeat = "no-repeat";
        background.style.backgroundPosition = "center";
        background.style.backgroundSize = bg.image.fit;

        this.lo.getPCCamera().clearColor.set(0,0,0,0);

        app.renderNextFrame = true;
    }

    async applyPanorama() {

        await this.lo.viewer.setSkybox(
            this.lo.projectcard.background.panorama.url
        );

        this.lo.viewer.setSkyboxRotation(
            this.lo.projectcard.background.panorama.rotation
        );
    }
}