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

// world
const world = new HittableList();
world.add(new Sphere([0, 0, -1], 0.5));
world.add(new Sphere([0, -100.5, -1], 100));

const ppm = camera.render(world);
const image = createImage(ppm);
root?.append(image);
