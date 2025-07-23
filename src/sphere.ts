import { vec3 } from "gl-matrix";
import Hittable, { HitRecord, type HitResult } from "./hittable";
import Ray from "./ray";
import type Interval from "./interval";
import type Material from "./materials/material";
import Lambertian from "./materials/lambertian";

export default class Sphere extends Hittable {
  center: vec3;
  radius: number;
  material: Material;

  constructor(
    center: vec3,
    radius: number,
    material: Material = new Lambertian(),
  ) {
    super();
    this.center = center;
    this.radius = radius;
    this.material = material;
  }

  hit(ray: Ray, interval: Interval): HitResult {
    // direction from ray origin to sphere center
    const qc = vec3.sub(vec3.create(), this.center, ray.orig);
    const a = vec3.dot(ray.dir, ray.dir);
    const h = vec3.dot(ray.dir, qc);
    const c = vec3.dot(qc, qc) - this.radius ** 2;
    const discriminant = h ** 2 - a * c;

    if (discriminant < 0)
      return {
        hitRecord: new HitRecord(),
        isRayHitting: false,
      };

    // Find the nearest root that lies in the acceptable range.
    const sqrtd = Math.sqrt(discriminant);
    let root = (h - sqrtd) / a;
    if (!interval.surrounds(root)) {
      root = (h + sqrtd) / a;
      if (!interval.surrounds(root)) {
        return {
          hitRecord: new HitRecord(),
          isRayHitting: false,
        };
      }
    }

    const rec = new HitRecord();
    rec.t = root;
    rec.point = ray.at(rec.t);
    rec.material = this.material;
    const outwardNormal = vec3.scale(
      vec3.create(),
      vec3.sub(vec3.create(), rec.point, this.center),
      1 / this.radius,
    );
    rec.setFaceNormal(ray, outwardNormal);
    return {
      hitRecord: rec,
      isRayHitting: true,
    };
  }
}
