import { vec3 } from "gl-matrix";

export default class ray {
    readonly orig: vec3
    readonly dir: vec3

    constructor(orig = vec3.create(), dir = vec3.create()) {
        this.orig = orig;
        this.dir = dir;
    }

    at(t: number): vec3 {
        const point = vec3.create()
        vec3.mul(point, this.dir, [t,t,t]);
        vec3.add(point, this.orig, point);
        return point;
    }
}