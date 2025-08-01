import { vec3 } from "gl-matrix";
import type Hittable from "./hittable";
import {
  degToRad,
  getStartingPixel,
  getUpperLeft,
  WORKER_COUNT,
  type WorkerData,
} from "./utils";

export default class Camera {
  aspectRatio = 1; // ratio of image width over height
  imageWidth = 100; // rendered image width in pixel count
  samplesPerPixel = 50; // amount of pixels to sample to anti-alias picture
  maxDepth = 10;
  fov = 90;
  lookfrom = vec3.create();
  lookat = vec3.fromValues(0, 0, -1);
  up = vec3.fromValues(0, 1, 0);
  center = vec3.create(); // camera center

  async render(world: Hittable): Promise<Uint8ClampedArray> {
    this.init();
    const bytes = this.imageWidth * this.imageHeight * 4;
    const pixelBuffer = new SharedArrayBuffer(bytes);

    // set up atomic counter
    const atomicBuffer = new SharedArrayBuffer(4);
    const atomic = new Int32Array(atomicBuffer); // 32 bit atomic
    Atomics.store(atomic, 0, this.imageWidth * this.imageHeight - 1);

    // spawn 16 workers to calculate
    const promises: Promise<boolean>[] = [];
    for (let id = 0; id < WORKER_COUNT; id++) {
      const worker = new Worker(new URL("worker.ts", import.meta.url));

      // send workload to worker
      const data: WorkerData = {
        id,
        world,
        imageWidth: this.imageWidth,
        imageHeight: this.imageHeight,
        samplesPerPixel: this.samplesPerPixel,
        samplingScale: this.samplingScale,
        pix00Loc: this.pix00Loc,
        pixDeltaU: this.pixDeltaU,
        pixDeltaV: this.pixDeltaV,
        maxDepth: this.maxDepth,
        center: this.center,
        atomicBuffer,
        pixelBuffer,
      };

      const promise = new Promise<boolean>((res) => {
        worker.onmessage = () => res(true);
        worker.postMessage(data);
      });
      promises.push(promise);
    }
    await Promise.all(promises);
    return new Uint8ClampedArray(pixelBuffer);
  }

  private imageHeight = 100; // rendered image height
  private pix00Loc = vec3.create(); // location of pixel (0,0)
  private pixDeltaU = vec3.create(); // distance between each pixel along x axis
  private pixDeltaV = vec3.create(); // distance between each pxiel along each y axis
  private samplingScale = 1 / this.samplesPerPixel;
  // camera frame basis vectors
  private u = vec3.create();
  private v = vec3.create();
  private w = vec3.create();

  private init() {
    this.imageHeight = Math.floor(this.imageWidth / this.aspectRatio);
    this.samplingScale = 1 / this.samplesPerPixel;

    this.center = vec3.clone(this.lookfrom);

    // viewport dimensions
    const focalLength = vec3.length(vec3.sub(vec3.create(), this.lookat, this.lookfrom));
    const theta = degToRad(this.fov);
    const h = Math.tan(theta / 2);
    const viewportHeight = 2 * h * focalLength;
    const viewportWidth = viewportHeight * (this.imageWidth / this.imageHeight);

    // calc uvw camera basis vectors
    this.w = vec3.normalize(vec3.create(), vec3.sub(vec3.create(), this.lookfrom, this.lookat));
    this.u = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this.up, this.w));
    this.v = vec3.cross(vec3.create(), this.w, this.u)

    // viewport vectors
    const viewportU = vec3.scale(vec3.create(), this.u, viewportWidth)
    const viewportV = vec3.scale(vec3.create(), this.v, -viewportHeight);

    this.pixDeltaU = vec3.scale(vec3.create(), viewportU, 1 / this.imageWidth);
    this.pixDeltaV = vec3.scale(vec3.create(), viewportV, 1 / this.imageHeight);

    const viewportUpperLeft = getUpperLeft(
      focalLength,
      this.w,
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
}
