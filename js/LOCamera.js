export class LOCamera {
    constructor(data) {
        this.position = data.position;
        this.angles = data.angles;
        this.distance = data.distance;
        this.fov = data.fov;
    }
}