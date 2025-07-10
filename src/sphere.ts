import { vec3 } from "gl-matrix";
import Hittable, { type HitRecord } from "./hittable";
import ray from "./ray";

export default class Sphere extends Hittable {
    private center: vec3;
    private radius: number;

    constructor(center: vec3, radius: number) {
        super();
        this.center = center;
        this.radius = radius;
    }

    hit(ray: ray, tmin: number, tmax: number, rec: HitRecord): boolean {
        // direction from ray origin to sphere center
        const qc = vec3.sub(vec3.create(), this.center, ray.orig);
        const a = vec3.dot(ray.dir, ray.dir);
        const h = vec3.dot(ray.dir, qc);
        const c = vec3.dot(qc, qc) - (this.radius ** 2);
        const discriminant = (h ** 2) - (a * c);

        if (discriminant < 0) return false;

        const sqrtd = Math.sqrt(discriminant);
        let root = (h - sqrtd) / a
        if (tmin > root || root < tmax) {
            root = (h + sqrtd) / a;
            if (tmin > root || root < tmax) {
                return false;
            }
        }

        rec.t = root;
        rec.point = ray.at(rec.t);
        const outwardNormal = vec3.sub(vec3.create(), rec.point, this.center);
        const checkNormal = vec3.sub(vec3.create(), ray.orig, this.center);
        console.log("check if true", vec3.equals(outwardNormal, checkNormal));
        rec.setFaceNormal(ray, outwardNormal);
        return true;
    }
}