import { vec3 } from "gl-matrix";
import {
  getColor,
  getPixelCenter,
  randomOffset,
  type WorkerData,
} from "./utils";
import Hittable from "./hittable";
import Ray from "./ray";
import Interval from "./interval";
import HittableList from "./hittableList";
import Sphere from "./sphere";
import Metal from "./materials/metal";
import Lambertian from "./materials/lambertian";
import Dielectric from "./materials/dielectric";

onmessage = (e) => {
  const data = e.data as WorkerData;
  const {
    id,
    imageWidth,
    samplesPerPixel,
    samplingScale,
    maxDepth,
    atomicBuffer,
    pixelBuffer,
  } = data;

  // convert serialized object to HittableList
  const serializedWorld = data.world as HittableList;
  const hittables = serializedWorld.hittables as any;
  const world = new HittableList();

  // reconstruct sphere objects due to inability to pass class instances
  // through workers
  for (const hittable of hittables) {
    const [x, y, z] = hittable.center;
    const t = hittable.material.tag;
    let m: any = new Lambertian([0.5,0.5,0.5]);
    if (t === "metal") {
      const [r, g, b] = hittable.material.albedo;
      const a = vec3.fromValues(r, g, b);
      m = new Metal(a, hittable.material.fuzz);
    } else if ( t === "dielectric") {
      m = new Dielectric(hittable.material.refractionIndex);
    } else {
      const [r, g, b] = hittable.material.albedo;
      m = new Lambertian([r,g,b]);
    }

    const rad = hittable.radius;
    const c = vec3.fromValues(x, y, z);
    world.add(new Sphere(c, rad, m));
  }

  const pixels = new Uint8ClampedArray(pixelBuffer);
  const atomic = new Int32Array(atomicBuffer);

  while (true) {
    // calculate ray
    const pixel = Atomics.sub(atomic, 0, 1);
    if (pixel < 0) break;

    const color = vec3.create();
    const row = Math.floor(pixel / imageWidth);
    const col = pixel % imageWidth;

    // anti aliasing
    for (let sample = 0; sample < samplesPerPixel; sample++) {
      const ray = getRay(data, col, row);
      vec3.add(color, color, rayColor(ray, world, maxDepth));
    }
    vec3.scale(color, color, samplingScale);

    // write color
    const [r, g, b] = getColor(color); // normalized color -> 0-255 range
    const offset = pixel * 4;
    pixels[offset] = r;
    pixels[offset + 1] = g;
    pixels[offset + 2] = b;
    pixels[offset + 3] = 255;
  }

  postMessage(`${id} done`);
};

function getRay(data: WorkerData, col: number, row: number): Ray {
  const { pix00Loc, pixDeltaU, pixDeltaV, center } = data;
  const offset = randomOffset();
  const pixelCenter = getPixelCenter(
    pix00Loc,
    col + offset[1],
    row + offset[0],
    pixDeltaU,
    pixDeltaV,
  );
  const dir = vec3.sub(vec3.create(), pixelCenter, center);
  return new Ray(center, dir);
}

function rayColor(ray: Ray, world: Hittable, depth: number): vec3 {
  if (depth < 0) return vec3.create();

  const { isRayHitting, hitRecord: rec } = world.hit(
    ray,
    new Interval(0.001, Infinity),
  );

  if (isRayHitting) {
    const { attenuation, scattered, isScattering } = rec.material.scatter(ray, rec);
    if (isScattering) {
      return vec3.mul(
        vec3.create(),
        rayColor(scattered, world, depth - 1),
        attenuation,
      );
    } else {
      return vec3.create();
    }
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
