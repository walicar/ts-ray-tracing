import { vec3 } from "gl-matrix";
import Interval from "./interval";
import type Hittable from "./hittable";

export const degToRad = (deg: number) => {
  return deg * (Math.PI / 180);
};

export const createImage = async (
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("bitmaprenderer");
  if (!ctx) return canvas;

  // setting dimensions of canvas
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = width.toString() + "px";
  canvas.style.height = height.toString() + "px";

  // creating bitmap
  const copyPixels = new Uint8ClampedArray(pixels);
  const imageData = new ImageData(copyPixels, width, height);
  const bitmap = await createImageBitmap(imageData);
  ctx.transferFromImageBitmap(bitmap);
  return canvas;
};

export const getColor = (color: vec3) => {
  const intensity = new Interval(0, 0.99999);
  let [rn, gn, bn] = [...color]; // rgb normalized

  // apply gamma function
  rn = linearToGamma(rn);
  gn = linearToGamma(gn);
  bn = linearToGamma(bn);

  // Translate the [0,1] component values to the byte range [0,255].
  const r = Math.round(intensity.clamp(rn) * 255);
  const g = Math.round(intensity.clamp(gn) * 255);
  const b = Math.round(intensity.clamp(bn) * 255);
  return [r, g, b];
};

// calculate upper left position of the viewport
export const getUpperLeft = (
  focalLength: number,
  cameraCenter: vec3,
  viewportU: vec3,
  viewportV: vec3,
) => {
  const focalVec = vec3.fromValues(0, 0, -focalLength);
  const halfViewportU = vec3.scale(vec3.create(), viewportU, 0.5);
  const halfViewportV = vec3.scale(vec3.create(), viewportV, 0.5);

  const result = vec3.create();
  vec3.add(result, cameraCenter, focalVec);
  vec3.sub(result, result, halfViewportU);
  vec3.sub(result, result, halfViewportV);
  return result;
};

export const getStartingPixel = (
  upperLeft: vec3,
  pixDeltaU: vec3,
  pixDeltaV: vec3,
) => {
  const result = vec3.create();
  vec3.add(result, pixDeltaU, pixDeltaV);
  vec3.scale(result, result, 0.5);
  vec3.add(result, upperLeft, result);
  return result;
};

export const getPixelCenter = (
  startingPixel: vec3,
  col: number,
  row: number,
  pixDeltaU: vec3,
  pixDeltaV: vec3,
) => {
  const offsetU = vec3.scale(vec3.create(), pixDeltaU, col);
  const offsetV = vec3.scale(vec3.create(), pixDeltaV, row);
  const result = vec3.create();
  vec3.add(result, offsetU, offsetV);
  vec3.add(result, startingPixel, result);
  return result;
};

export const randomNormal = () => {
  const randomNum = Math.floor(Math.random() * 2 ** 32);
  const MAX = 2 ** 32;
  return randomNum / (MAX + 1);
};

export const random = (min: number, max: number) =>
  min + (max - min) * randomNormal();

export const randomOffset = () => {
  return vec3.fromValues(randomNormal() - 0.5, randomNormal() - 0.5, 0);
};

export const randomNormalVec = () =>
  vec3.fromValues(randomNormal(), randomNormal(), randomNormal());

export const randomVec = (min: number, max: number) =>
  vec3.fromValues(random(min, max), random(min, max), random(min, max));

export const randomUnitVec = () => {
  while (true) {
    const p = randomVec(-1, 1);
    const lenSq = vec3.squaredLength(p);
    if (1e-8 < lenSq && lenSq <= 1) return vec3.normalize(vec3.create(), p);
  }
};

export const randomUnitVecHemisphere = (normal: vec3) => {
  const dir = randomUnitVec();
  return vec3.dot(dir, normal) > 0 ? dir : vec3.negate(vec3.create(), dir);
};

export interface WorkerData {
  id: number;
  world: Hittable;
  startAt: number;
  endAt: number;
  imageWidth: number;
  imageHeight: number;
  samplesPerPixel: number;
  samplingScale: number;
  maxDepth: number;
  pix00Loc: vec3;
  pixDeltaU: vec3;
  pixDeltaV: vec3;
  center: vec3;
  buffer: SharedArrayBuffer;
}

export const linearToGamma = (comp: number) => {
  if (comp > 0) {
    return Math.sqrt(comp);
  }
  return 0;
};

export const nearZero = (vec: vec3) => {
  const s = 1e-8;
  let [x, y, z] = vec.map((comp) => Math.abs(comp));
  return x < s && y < s && z < s;
};

// v - 2*dot(v,n)*n;
export const reflect = (v: vec3, n: vec3) => {
  const s = 2 * vec3.dot(v, n);
  const b = vec3.scale(vec3.create(), n, s);
  return vec3.sub(vec3.create(), v, b);
};

export const WORKER_COUNT = 16;
