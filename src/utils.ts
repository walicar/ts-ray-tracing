import { vec3 } from "gl-matrix";
import Interval from "./interval";

export const degToRad = (deg: number) => {
  return deg * (Math.PI / 180);
};

/**
 * @param ppm file .ppm
 * @returns image in canvas format
 */
export const createImage = async (pixels: Uint8ClampedArray, width: number, height: number) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("bitmaprenderer");
  if (!ctx) return canvas;

  // setting dimensions of canvas
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = width.toString() + "px";
  canvas.style.height = height.toString() + "px";

  // creating bitmap
  const imageData = new ImageData(pixels, width, height);
  const bitmap = await createImageBitmap(imageData)
  ctx.transferFromImageBitmap(bitmap)
  return canvas;
};

export const getColor = (color: vec3) => {
  // Translate the [0,1] component values to the byte range [0,255].
  const intensity = new Interval(0, 0.99999);
  const [rn, gn, bn] = [...color] // rgb normalized
  const r = Math.round(intensity.clamp(rn) * 255);
  const g = Math.round(intensity.clamp(gn) * 255);
  const b = Math.round(intensity.clamp(bn) * 255);
  return [r,g,b];
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
  const [randomNum] = crypto.getRandomValues(new Uint32Array(1));
  const MAX = 2 ** 32;
  return randomNum / (MAX + 1);
}

export const random = (min: number, max: number) => min + (max - min) * randomNormal();
