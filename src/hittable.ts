import { vec3 } from "gl-matrix";
import type ray from "./ray";

export default abstract class Hittable {
    abstract hit(r: ray, tmin: number, tmax: number, hitRecord: HitRecord): boolean;
}

export class HitRecord {
    point: vec3;
    normal: vec3;
    t: number;
    isFrontFace: boolean;

    constructor(point:vec3, normal:vec3, t:number) {
        this.point = point;
        this.normal = normal;
        this.t = t;
        this.isFrontFace = false;
    }

    /**
     * set isFrontFace and the normal
     * @param r 
     * @param outwardNormal 
     */
    setFaceNormal(r: ray, outwardNormal: vec3) {
        this.isFrontFace = vec3.dot(r.dir, outwardNormal) < 0;
        this.normal = this.isFrontFace ? outwardNormal : vec3.negate(vec3.create(), outwardNormal);
    }
}