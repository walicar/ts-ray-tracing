import { vec3 } from "gl-matrix";
import type { HitRecord } from "../hittable";
import Ray from "../ray";
import Material, { type ScatterResult } from "./material";
import { nearZero, randomUnitVec } from "../utils";

export default class Lambertian extends Material {
  tag = "lambertian";
  albedo: vec3; // fractional reflectance

  constructor(albedo = vec3.fromValues(0.5, 0.5, 0.5)) {
    super();
    this.albedo = albedo;
  }

  scatter(_ray: Ray, hitRecord: HitRecord): ScatterResult {
    const { normal, point } = hitRecord;
    let scatterDir = vec3.add(vec3.create(), normal, randomUnitVec());

    // catch rays that do not scatter
    if (nearZero(scatterDir)) {
      scatterDir = normal;
    }

    return {
      scattered: new Ray(point, scatterDir),
      attenuation: this.albedo,
      isScattering: true,
    };
  }
}
