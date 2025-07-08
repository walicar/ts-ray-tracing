import type { vec3 } from "gl-matrix";
import Hittable, { type HitRecord } from "./hittable";
import type ray from "./ray";

export default class Sphere extends Hittable {
    private center: vec3;
    private radius: number;

    constructor(center: vec3, radius: number) {
        super();
        this.center = center;
        this.radius = radius;
    }

    hit(r: ray, tmin: number, tmax: number, hitRecord: HitRecord): boolean {
        throw new Error("Method not implemented.");
    } 

}