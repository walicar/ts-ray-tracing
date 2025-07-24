import { vec3 } from "gl-matrix";
import type Ray from "./ray";
import type Interval from "./interval";

export default abstract class Hittable {
  abstract hit(r: Ray, interval: Interval): HitResult;
}

export interface HitResult {
  hitRecord: HitRecord;
  isRayHitting: boolean;
}

export class HitRecord {
  point: vec3;
  normal: vec3;
  material: any;
  t: number;
  isFrontFace: boolean;

  constructor(
    point: vec3 = vec3.create(),
    normal: vec3 = vec3.create(),
    t: number = 0,
  ) {
    this.point = point;
    this.normal = normal;
    this.t = t;
    this.isFrontFace = false;
  }

  /**
   * set isFrontFace and the normal
   * @param r
   * @param outwardNormal
   */
  setFaceNormal(r: Ray, outwardNormal: vec3) {
    this.isFrontFace = vec3.dot(r.dir, outwardNormal) < 0;
    this.normal = this.isFrontFace
      ? outwardNormal
      : vec3.negate(vec3.create(), outwardNormal);
  }
}
