import { vec3 } from "gl-matrix";
import Hittable, { HitRecord, type HitResult } from "./hittable";
import ray from "./ray";

export default class Sphere extends Hittable {
    private center: vec3;
    private radius: number;

    constructor(center: vec3, radius: number) {
        super();
        this.center = center;
        this.radius = radius;
    }

    hit(ray: ray, tmin: number, tmax: number): HitResult {
        // direction from ray origin to sphere center
        const qc = vec3.sub(vec3.create(), this.center, ray.orig);
        const a = vec3.dot(ray.dir, ray.dir);
        const h = vec3.dot(ray.dir, qc);
        const c = vec3.dot(qc, qc) - (this.radius ** 2);
        const discriminant = (h ** 2) - (a * c);

        if (discriminant < 0) return {
            hitRecord: new HitRecord(),
            isRayHitting: false
        };

        // Find the nearest root that lies in the acceptable range.
        const sqrtd = Math.sqrt(discriminant);
        let root = (h - sqrtd) / a
        if (root <= tmin || tmax <= root) {
            root = (h + sqrtd) / a;
            if (root <= tmin || tmax <= root) {
                return {
                    hitRecord: new HitRecord(),
                    isRayHitting: false,
                };
            }
        }

        const rec = new HitRecord();
        rec.t = root;
        rec.point = ray.at(rec.t);
        const outwardNormal = vec3.scale(vec3.create(), vec3.sub(vec3.create(), rec.point, this.center), 1 / this.radius);
        rec.setFaceNormal(ray, outwardNormal);
        return {
            hitRecord: rec,
            isRayHitting: true
        };
    }
}