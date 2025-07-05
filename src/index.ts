import { vec3 } from "gl-matrix";
import "./index.css";
import { createImage, getPixelCenter, getStartingPixel, getUpperLeft, rayColor, writeColor } from "./utils";
import ray from "./ray";

const root = document.querySelector("#root");


// image
const ar = 16 / 9;
const width = 400;
const height = Math.floor(width / ar);

// camera and viewport
const focalLength = 1;
const viewportHeight = 2;
const viewportWidth = viewportHeight * (width / height);
const cameraCenter = vec3.create();

// viewport vectors
const viewportU = vec3.fromValues(viewportWidth, 0, 0);
const viewportV = vec3.fromValues(0, -viewportHeight, 0);
const pixDeltaU = vec3.div(vec3.create(), viewportU, [width, width, width],);
const pixDeltaV = vec3.div(vec3.create(), viewportV, [height, height, height],);

const viewportUpperLeft = getUpperLeft(focalLength, cameraCenter, viewportU, viewportV);
const pix00Loc = getStartingPixel(viewportUpperLeft, pixDeltaU, pixDeltaV);

// create ppm header
let ppm = `P3\n${width} ${height}\n255\n`;

// create ppm image
for (let row = 0; row < height; row++) {
  for (let col = 0; col < width; col++) {
    const pixelCenter = getPixelCenter(pix00Loc, col, row, pixDeltaU, pixDeltaV);
    const dir = vec3.sub(vec3.create(), pixelCenter, cameraCenter);
    const r = new ray(cameraCenter, dir);
    const color = rayColor(r);
    ppm += writeColor(color);
  }
}

const image = createImage(ppm);
root?.append(image);
