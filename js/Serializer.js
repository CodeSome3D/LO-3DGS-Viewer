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

        // Validate cameras
        if (!project.cameras || typeof project.cameras !== 'object' || Array.isArray(project.cameras)) {
            project.cameras = {};
        } else {
            for (const [id, cam] of Object.entries(project.cameras)) {
                if (!cam || typeof cam !== 'object') {
                    delete project.cameras[id];
                    continue;
                }
                cam.position = cam.position && typeof cam.position === 'object' ? cam.position : { x: 0, y: 0, z: 0 };
                cam.position.x = Number(cam.position.x) || 0;
                cam.position.y = Number(cam.position.y) || 0;
                cam.position.z = Number(cam.position.z) || 0;

                cam.angles = cam.angles && typeof cam.angles === 'object' ? cam.angles : { x: 0, y: 0, z: 0 };
                cam.angles.x = Number(cam.angles.x) || 0;
                cam.angles.y = Number(cam.angles.y) || 0;
                cam.angles.z = Number(cam.angles.z) || 0;

                cam.distance = Number(cam.distance) || 5;
                cam.fov = Number(cam.fov) || 75;
            }
        }

        // Validate hotspots
        if (!Array.isArray(project.hotspots)) {
            project.hotspots = [];
        } else {
            project.hotspots = project.hotspots.filter(h => h && typeof h === 'object' && h.id).map(h => {
                h.position = h.position && typeof h.position === 'object' ? h.position : { x: 0, y: 0, z: 0 };
                h.position.x = Number(h.position.x) || 0;
                h.position.y = Number(h.position.y) || 0;
                h.position.z = Number(h.position.z) || 0;
                
                h.title = typeof h.title === 'string' ? h.title : "New Hotspot";
                h.description = typeof h.description === 'string' ? h.description : "";
                h.color = typeof h.color === 'string' ? h.color : "#FFFFFF";
                
                return h;
            });
        }

        return project;

    }

}
