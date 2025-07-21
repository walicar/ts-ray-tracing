import { vec3 } from "gl-matrix";
import {
  getColor,
  getPixelCenter,
  randomOffset,
  type WorkerData,
} from "./utils";
import Hittable from "./hittable";
import ray from "./ray";
import Interval from "./interval";
import HittableList from "./hittableList";
import Sphere from "./sphere";

onmessage = (e) => {
  const data = e.data as WorkerData;
  const {
    id,
    startAt,
    endAt,
    imageWidth,
    samplesPerPixel,
    samplingScale,
    buffer,
  } = data;

  // convert serialized object to HittableList
  const serializedWorld = data.world as HittableList;
  const hittables = serializedWorld.hittables as any;
  const world = new HittableList();

  for (const hittable of hittables) {
    const [x, y, z] = hittable.center;
    const r = hittable.radius;
    const c = vec3.fromValues(x, y, z);
    world.add(new Sphere(c, r));
  }

  const pixels = new Uint8ClampedArray(buffer);
  let pixel = startAt;

  while (pixel < endAt) {
    const color = vec3.create();
    const row = Math.floor(pixel / imageWidth);
    const col = pixel % imageWidth;

    // anti aliasing
    for (let sample = 0; sample < samplesPerPixel; sample++) {
      const ray = getRay(data, col, row);
      vec3.add(color, color, rayColor(ray, world));
    }
    vec3.scale(color, color, samplingScale);

    // write color
    const [r, g, b] = getColor(color); // normalized color -> 0-255 range
    const offset = pixel * 4;
    pixels[offset] = r;
    pixels[offset + 1] = g;
    pixels[offset + 2] = b;
    pixels[offset + 3] = 255;
    pixel += 1;
  }

  postMessage(`${id} done`);
};

function getRay(data: WorkerData, col: number, row: number): ray {
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
  return new ray(center, dir);
}

function rayColor(ray: ray, world: Hittable) {
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
