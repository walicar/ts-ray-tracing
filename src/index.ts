import "./index.css";
import { createImage } from "./utils";
import Sphere from "./sphere";
import HittableList from "./hittableList";
import Camera from "./camera";

const root = document.querySelector("#root");

// add camera
const camera = new Camera();
camera.aspectRatio = 16 / 9;
camera.imageWidth = 400;
const imageHeight = Math.floor(camera.imageWidth / camera.aspectRatio);

// world
const world = new HittableList();
world.add(new Sphere([0, 0, -1], 0.5));
world.add(new Sphere([0, -100.5, -1], 100));

const start = performance.now();
const pixels = await camera.render(world);
const image = await createImage(pixels, camera.imageWidth, imageHeight);
root?.append(image);
const end = performance.now();
console.log(end - start);
