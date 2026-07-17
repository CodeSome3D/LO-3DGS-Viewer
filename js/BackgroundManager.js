export class BackgroundManager {

    constructor(lo) {

        this.lo = lo;

    }

    apply() {

        const background =
            this.lo.projectcard.background;

        switch (background.type) {

            case "color":
                this.applyColor(background);
                break;

            case "gradient":
                this.applyGradient(background);
                break;

            case "image":
                this.applyImage(background);
                break;

            case "panorama":
                this.applyPanorama(background);
                break;

        }

    }

    applyColor(background) {}

    applyGradient(background) {}

    applyImage(background) {}

    applyPanorama(background) {}

}