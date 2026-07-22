export class Serializer {
    constructor(lo) {
        this.lo = lo;
    }

    export(project) {
        return JSON.stringify(project, null, 2);
    }

    import(json) {

        const project = JSON.parse(json);

        project.project ??= {};

        project.project.name ??= "Untitled Project";
        project.project.version ??= 2;
        project.project.scene ??= "./scene.sog";
        project.project.theme ??= "dark";
        project.project.autospinOnLoad ??= false;

        project.project.background ??= {};

        project.project.background.type ??= "color";
        project.project.background.color ??= "#2a2a2a";

        project.project.background.gradient ??= {
            mode: "linear",
            angle: 135,
            colors: [
                "#202020",
                "#606060"
            ]
        };

        project.project.background.image ??= {
            url: "",
            fit: "cover"
        };

        project.project.background.panorama ??= {
            url: "",
            rotation: 0
        };

        project.cameras ??= {};
        project.hotspots ??= [];

        return project;

    }

}
