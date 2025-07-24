import { vec3 } from "gl-matrix";
import type { HitRecord } from "../hittable";
import Ray from "../ray";
import Material, { type ScatterResult } from "./material";
import { randomNormal, reflect, refract } from "../utils";

export default class Dielectric extends Material {
  tag = "dielectric";
  refractionIndex: number;

  constructor(refractionIndex = 1) {
    super();
    this.refractionIndex = refractionIndex;
  }

  scatter(ray: Ray, hitRecord: HitRecord): ScatterResult {
    const { normal, point, isFrontFace } = hitRecord;
    const ri = isFrontFace ? (1 / this.refractionIndex) : this.refractionIndex;

    const normDir = vec3.normalize(vec3.create(), ray.dir);
    const negNormDir = vec3.negate(vec3.create(), normDir);
    const cosTheta = Math.min(vec3.dot(negNormDir, normal), 1);
    const sinTheta = Math.sqrt(1.0 - cosTheta**2);

    const cannotRefract =  ri * sinTheta > 1.0;
    const shouldReflect = Dielectric.reflectance(cosTheta, this.refractionIndex) > randomNormal();
    let scatterDir = vec3.create();

    if (cannotRefract || shouldReflect) {
      scatterDir = reflect(normDir, normal);
    } else {
      scatterDir = refract(normDir, normal, ri);
    }

    return {
      scattered: new Ray(point, scatterDir),
      attenuation: vec3.fromValues(1, 1, 1),
      isScattering: true
    };
  }

  // Schlick's approximation for reflectance
  static reflectance(cosine: number, refractionIndex: number) {
    let r0 = (1-refractionIndex) / (1+refractionIndex);
    r0 *= r0;
    return r0 + (1-r0)*Math.pow(1-cosine, 5);
  }
}