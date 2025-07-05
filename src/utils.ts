import { vec3 } from "gl-matrix";
import type ray from "./ray";

/**
 * @param ppm file .ppm
 * @returns image in canvas format
 */
export const createImage = (ppm: string) => {
  const DIMS_OFFSET = 1; // which line to get dims from .ppm
  const TRIP_OFFSET = 3; // which line the data starts in .ppm

  const entries = ppm.split("\n").filter((line) => !line.startsWith("#"));
  const dims = entries[DIMS_OFFSET].split(" ");
  const width = parseInt(dims[0]);
  const height = parseInt(dims[1]);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // setting dimensions of canvas
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = width.toString() + "px";
  canvas.style.height = height.toString() + "px";

  // create image
  const imageData = ctx.createImageData(width, height);
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const pixelIndex = row * width + col;
      const [r, g, b] = entries[pixelIndex + TRIP_OFFSET]
        .trim()
        .split(" ")
        .map((val) => parseInt(val));
      const offset = pixelIndex * 4;
      imageData.data[offset] = r;
      imageData.data[offset + 1] = g;
      imageData.data[offset + 2] = b;
      imageData.data[offset + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
};


/**
 * appends a color triplet entry to the ppm file 
 * @param ppm file .ppm
 * @param color rgb color
 */
export const writeColor = (color: vec3) => {
  const ir = color[0];
  const ig = color[1];
  const ib = color[2];

  // Translate the [0,1] component values to the byte range [0,255].
  const r = ir * 255;
  const g = ig * 255;
  const b = ib * 255;

  return `${r} ${g} ${b}\n`;
}

// calculate upper left position of the viewport
export const getUpperLeft = (focalLength: number, cameraCenter: vec3, viewportU: vec3, viewportV: vec3) => {
  const focalVec = vec3.fromValues(0, 0, focalLength);
  const halfViewportU = vec3.div(vec3.create(), viewportU, [2, 2, 2]);
  const halfViewportV = vec3.div(vec3.create(), viewportV, [2, 2, 2]);

  const result = vec3.create();
  vec3.sub(result, halfViewportU, halfViewportV);
  vec3.sub(result, focalVec, result);
  vec3.sub(result, cameraCenter, result);
  return result;
}


export const getStartingPixel = (upperLeft: vec3, pixDeltaU: vec3, pixDeltaV: vec3) => {
  const result = vec3.create();
  vec3.add(result, pixDeltaU, pixDeltaV);
  vec3.multiply(result, [0.5, 0.5, 0.5], result);
  vec3.add(result, upperLeft, result);
  return result;
}

export const getPixelCenter = (startingPixel: vec3, col: number, row: number, pixDeltaU: vec3, pixDeltaV: vec3) => {
  const offsetU = vec3.mul(vec3.create(), [col, col, col], pixDeltaU);
  const offsetV = vec3.mul(vec3.create(), [row, row, row], pixDeltaV);
  const result = vec3.create();
  vec3.add(result, offsetU, offsetV);
  vec3.add(result, startingPixel, result);
  return result;
}

/**
 * could use vec3.lerp here
 * @param ray 
 * @returns 
 */
export const rayColor = (ray: ray) => {
  const unit = vec3.normalize(vec3.create(), ray.dir);
  const a = 0.5 * (unit[1] + 1); // -1 to 1 to 0, 1
  const result = vec3.create();
  const start = vec3.mul(vec3.create(), [1-a,1-a,1-a], [1,1,1]);
  const end = vec3.mul(vec3.create(), [a,a,a], [0.3,0.7,1]);
  vec3.add(result, start, end);
  return result;
}