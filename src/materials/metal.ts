import { vec3 } from "gl-matrix";
import Material, { type ScatterResult } from "./material";
import Ray from "../ray";
import type { HitRecord } from "../hittable";
import { randomUnitVec, reflect } from "../utils";

export default class Metal extends Material {
  tag = "metal";
  albedo: vec3; // fractional reflectance
  fuzz: number;

  constructor(albedo = vec3.create(), fuzz = 0) {
    super();
    this.albedo = albedo;
    this.fuzz = fuzz;
  }

  scatter(ray: Ray, hitRecord: HitRecord): ScatterResult {
    const { normal, point } = hitRecord;
    let reflectedDir = reflect(ray.dir, normal);
    const fuzzOffset = vec3.scale(vec3.create(), randomUnitVec(), this.fuzz);
    const reflectedNorm = vec3.normalize(vec3.create(), reflectedDir);
    vec3.add(reflectedDir, fuzzOffset, reflectedNorm);
    const scattered =  new Ray(point, reflectedDir);
    return {
      scattered,
      attenuation: this.albedo,
      isScattering: vec3.dot(scattered.dir, normal) > 0,
    };
  }
}
