import { vec3 } from "gl-matrix";
import type Hittable from "./hittable";
import Interval from "./interval";
import ray from "./ray";
import {
  getPixelCenter,
  getStartingPixel,
  getUpperLeft,
  writeColor,
} from "./utils";

export default class Camera {
  aspectRatio = 1; // ratio of image width over height
  imageWidth = 100; // rendered image width in pixel count
  focalLength = 1;
  center = vec3.create(); // camera center

  render(world: Hittable): string {
    this.init();
    // create ppm header
    let ppm = `P3\n${this.imageWidth} ${this.imageHeight}\n255\n`;
    const { pix00Loc, pixDeltaU, pixDeltaV, center } = this;

    // create ppm image
    for (let row = 0; row < this.imageHeight; row++) {
      for (let col = 0; col < this.imageWidth; col++) {
        const pixelCenter = getPixelCenter(
          pix00Loc,
          col,
          row,
          pixDeltaU,
          pixDeltaV,
        );
        const dir = vec3.sub(vec3.create(), pixelCenter, center);
        const r = new ray(center, dir);
        const color = this.rayColor(r, world);
        ppm += writeColor(color);
      }
    }
    return ppm;
  }

  private imageHeight = 0; // rendered image height
  private pix00Loc = vec3.create(); // location of pixel (0,0)
  private pixDeltaU = vec3.create(); // distance between each pixel along x axis
  private pixDeltaV = vec3.create(); // distance between each pxiel along each y axis

  private init() {
    this.imageHeight = Math.floor(this.imageWidth / this.aspectRatio);

    // viewport dimensions
    const viewportHeight = 2;
    const viewportWidth = viewportHeight * (this.imageWidth / this.imageHeight);

    // viewport vectors
    const viewportU = vec3.fromValues(viewportWidth, 0, 0);
    const viewportV = vec3.fromValues(0, -viewportHeight, 0);

    this.pixDeltaU = vec3.scale(vec3.create(), viewportU, 1 / this.imageWidth);
    this.pixDeltaV = vec3.scale(vec3.create(), viewportV, 1 / this.imageHeight);

    const viewportUpperLeft = getUpperLeft(
      this.focalLength,
      this.center,
      viewportU,
      viewportV,
    );
    this.pix00Loc = getStartingPixel(
      viewportUpperLeft,
      this.pixDeltaU,
      this.pixDeltaV,
    );
  }

  /**
   * Get color from rays in world
   * @note could lerp here
   * @returns color in vec3
   */
  private rayColor(ray: ray, world: Hittable) {
    const { isRayHitting, hitRecord: rec } = world.hit(
      ray,
      new Interval(0, Infinity),
    );
    if (isRayHitting) {
      const { normal: n } = rec;
      return vec3.scale(
        vec3.create(),
        vec3.fromValues(n[0] + 1, n[1] + 1, n[2] + 1),
        0.5,
      );
    }

    // map normal to from 0 to 1, background color;
    const unit = vec3.normalize(vec3.create(), ray.dir);
    const a = 0.5 * (unit[1] + 1); // -1 to 1 to 0, 1
    const result = vec3.create();
    const start = vec3.scale(vec3.create(), [1, 1, 1], 1 - a);
    const end = vec3.scale(vec3.create(), [0.3, 0.7, 1], a);
    vec3.add(result, start, end);
    return result;
  }
}
