import type { vec3 } from "gl-matrix";
import type ray from "./ray";

export default abstract class Hittable {
    abstract hit(r: ray, tmin: number, tmax: number, hitRecord: HitRecord): boolean;
}

export interface HitRecord {
    point: vec3;
    normal: vec3;
    t: number
}