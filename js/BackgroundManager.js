export class BackgroundManager {

    constructor(lo) {
        this.lo = lo;

        this.panoramaEntity = null;
        this.panoramaMaterial = null;
        this.panoramaTexture = null;
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
                this.applyImage();
                break;

            case "panorama":
                this.applyPanorama();
                break;
        }
    }

    applyColor() {

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

    applyTransparent() {

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

    applyGradient() {

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

    applyImage() {

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

    applyPanorama() {

        const bg = this.lo.projectcard.background;
        
        console.log("Panorama:", bg.panorama);
        
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
            `url("${bg.panorama.url}")`;

        background.style.backgroundRepeat = "no-repeat";

        background.style.backgroundPosition = "center";

        background.style.backgroundSize = "contain";

        this.lo.getPCCamera().clearColor.set(0,0,0,0);

        app.renderNextFrame = true;
    }

}