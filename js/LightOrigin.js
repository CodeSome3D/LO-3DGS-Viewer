export class LightOrigin {

    constructor() {

        // Application state
        this.projectcard = {};
        this.hotspots = [];
        this.cameras = {};

        this.selectedHotspot = null;
        this.selectedCamera = null;

        // PlayCanvas
        this.app = null;
        this.camera = null;
        this.scene = null;

        // DOM
        this.viewer = null;
        this.canvas = null;

        // Managers
        this.cameraManager = null;
        this.hotspotManager = null;
        this.projectManager = null;
        this.serializer = null;
        this.uiManager = null;
        this.pickingManager = null;
        this.tourManager = null;
        this.tourUIManager = null;

        // Runtime flags
        this.mode = "editor";

    }

}