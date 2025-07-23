import { vec3 } from "gl-matrix";
import Material, { type ScatterResult } from "./material";
import Ray from "../ray";
import type { HitRecord } from "../hittable";
import { reflect } from "../utils";

export default class Metal extends Material {
    tag = "metal";
    albedo: vec3; // fractional reflectance

    constructor(albedo = vec3.create()) {
        super();
        this.albedo = albedo
    }

    scatter(ray: Ray, hitRecord: HitRecord): ScatterResult {
        const { normal, point } = hitRecord;
        let reflectedDir = reflect(ray.dir, normal);

        return {
            scattered: new Ray(point, reflectedDir),
            attenuation: this.albedo
        }
    }
}