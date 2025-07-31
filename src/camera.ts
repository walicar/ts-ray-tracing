import { vec3 } from "gl-matrix";
import type Hittable from "./hittable";
import {
  getStartingPixel,
  getUpperLeft,
  WORKER_COUNT,
  type WorkerData,
} from "./utils";

export default class Camera {
  aspectRatio = 1; // ratio of image width over height
  imageWidth = 100; // rendered image width in pixel count
  focalLength = 1;
  samplesPerPixel = 50; // amount of pixels to sample to anti-alias picture
  maxDepth = 10;
  center = vec3.create(); // camera center

  async render(world: Hittable): Promise<Uint8ClampedArray> {
    this.init();
    const {
      imageWidth,
      imageHeight,
      maxDepth,
      samplesPerPixel,
      samplingScale,
      pix00Loc,
      pixDeltaU,
      pixDeltaV,
      center,
    } = this;

    const bytes = imageWidth * imageHeight * 4;
    const pixelBuffer = new SharedArrayBuffer(bytes);

    // set up atomic counter
    const atomicBuffer = new SharedArrayBuffer(4);
    const atomic = new Int32Array(atomicBuffer); // 32 bit atomic
    Atomics.store(atomic, 0, imageWidth * imageHeight);

    // spawn 16 workers to calculate
    const promises: Promise<boolean>[] = [];
    for (let id = 0; id < WORKER_COUNT; id++) {
      const worker = new Worker(new URL("worker.ts", import.meta.url));

      // send workload to worker
      const data: WorkerData = {
        id,
        world,
        imageWidth,
        imageHeight,
        samplesPerPixel,
        samplingScale,
        pix00Loc,
        pixDeltaU,
        pixDeltaV,
        maxDepth,
        center,
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
}
