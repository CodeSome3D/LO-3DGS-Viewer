export class Serializer {
    constructor(lo) {
        this.lo = lo;
    }

    export(project) {
        return JSON.stringify(project, null, 2);
    }

    import(json) {
        return JSON.parse(json);
    }

}
