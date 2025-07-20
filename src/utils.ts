import { vec3 } from "gl-matrix";
import Interval from "./interval";

export const degToRad = (deg: number) => {
  return deg * (Math.PI / 180);
};

/**
 * @param ppm file .ppm
 * @returns image in canvas format
 */
export const createImage = async (ppm: string) => {
  const DIMS_OFFSET = 1; // which line to get dims from .ppm
  const TRIP_OFFSET = 3; // which line the data starts in .ppm

  const entries = ppm.split("\n").filter((line) => !line.startsWith("#"));
  const dims = entries[DIMS_OFFSET].split(" ");
  const width = parseInt(dims[0]);
  const height = parseInt(dims[1]);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("bitmaprenderer");
  if (!ctx) return canvas;

  // setting dimensions of canvas
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = width.toString() + "px";
  canvas.style.height = height.toString() + "px";

  // create image
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const pixelIndex = row * width + col;
      const [r, g, b] = entries[pixelIndex + TRIP_OFFSET]
        .trim()
        .split(" ")
        .map((val) => parseInt(val));
      const offset = pixelIndex * 4;
      pixels[offset] = r;
      pixels[offset + 1] = g;
      pixels[offset + 2] = b;
      pixels[offset + 3] = 255;
    }
  }
  const imageData = new ImageData(pixels, width, height);
  const bitmap = await createImageBitmap(imageData)
  ctx.transferFromImageBitmap(bitmap)
  return canvas;
};

/**
 * appends a color triplet entry to the ppm file
 * @param ppm file .ppm
 * @param color rgb color
 */
export const writeColor = (color: vec3) => {
  // Translate the [0,1] component values to the byte range [0,255].
  const intensity = new Interval(0, 0.99999);
  const [rn, gn, bn] = [...color] // rgb normalized
  const r = Math.round(intensity.clamp(rn) * 255);
  const g = Math.round(intensity.clamp(gn) * 255);
  const b = Math.round(intensity.clamp(bn) * 255);
  return `${r} ${g} ${b}\n`;
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
