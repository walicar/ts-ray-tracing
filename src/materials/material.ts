import type { vec3 } from "gl-matrix";
import type { HitRecord } from "../hittable";
import type Ray from "../ray";

export default abstract class Material {
  tag = "none";
  abstract scatter(ray: Ray, hitRecord: HitRecord): ScatterResult;
}

export interface ScatterResult {
  attenuation: vec3; // light reduction
  scattered: Ray;
}
