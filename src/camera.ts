import { vec3 } from "gl-matrix";
import type Hittable from "./hittable";
import Interval from "./interval";
import ray from "./ray";
import {
  getColor,
  getPixelCenter,
  getStartingPixel,
  getUpperLeft,
  randomNormal,
} from "./utils";

export default class Camera {
  aspectRatio = 1; // ratio of image width over height
  imageWidth = 100; // rendered image width in pixel count
  focalLength = 1;
  samplesPerPixel = 10 // amount of pixels to sample to anti-alias picture
  center = vec3.create(); // camera center

  render(world: Hittable): Uint8ClampedArray {
    this.init();
    const { imageWidth, imageHeight, samplesPerPixel, samplingScale } = this;
    const pixels = new Uint8ClampedArray(imageWidth * imageHeight * 4);

    // create image
    for (let row = 0; row < imageHeight; row++) {
      for (let col = 0; col < imageWidth; col++) {
        const color = vec3.create();
        // anti aliasing
        for (let sample = 0; sample < samplesPerPixel; sample++) {
          const ray = this.getRay(col, row);
          vec3.add(color, color, this.rayColor(ray, world));
        }
        vec3.scale(color, color, samplingScale);

        // write color
        const [r, g, b] = getColor(color); // normalized color -> 0-255 range
        const pixel = (row * imageWidth) + col;
        const offset = pixel * 4;
        pixels[offset] = r;
        pixels[offset + 1] = g;
        pixels[offset + 2] = b;
        pixels[offset + 3] = 255;
      }
    }
    return pixels;
  }

  private imageHeight = 100; // rendered image height
  private pix00Loc = vec3.create(); // location of pixel (0,0)
  private pixDeltaU = vec3.create(); // distance between each pixel along x axis
  private pixDeltaV = vec3.create(); // distance between each pxiel along each y axis
  private samplingScale = 1 / this.samplesPerPixel;

  private init() {
    this.imageHeight = Math.floor(this.imageWidth / this.aspectRatio);
    this.samplingScale = 1 / this.samplesPerPixel;

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

  private getRay(col: number, row: number): ray {
    const { pix00Loc, pixDeltaU, pixDeltaV, center } = this;
    const offset = this.randomOffset();
    const pixelCenter = getPixelCenter(
      pix00Loc,
      col + offset[1],
      row + offset[0],
      pixDeltaU,
      pixDeltaV,
    );
    const dir = vec3.sub(vec3.create(), pixelCenter, center);
    return new ray(center, dir);
  }

  /**
   * Returns the vector to a random point in the [-.5,-.5]-[+.5,+.5] unit square.
   */
  private randomOffset() {
    return vec3.fromValues(randomNormal() - 0.5, randomNormal() - 0.5, 0);
  }
}
