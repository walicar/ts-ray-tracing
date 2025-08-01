import "./index.css";
import { createImage } from "./utils";
import Sphere from "./sphere";
import HittableList from "./hittableList";
import Camera from "./camera";
import Lambertian from "./materials/lambertian";
import Metal from "./materials/metal";
import Dielectric from "./materials/dielectric";

const root = document.querySelector("#root");

// add camera
const camera = new Camera();
camera.aspectRatio = 16 / 9;
camera.imageWidth = 800;
camera.fov = 30;
camera.lookfrom = [-2,2,1];
camera.lookat = [0,0,-1];
const imageHeight = Math.floor(camera.imageWidth / camera.aspectRatio);

// materials
const ground = new Lambertian([0.8, 0.8, 0]);
const center = new Lambertian([0.1, 0.2, 0.5]);
const left = new Dielectric(1.5);
const bubble = new Dielectric(1 / 1.5);
const right = new Metal([0.8, 0.6, 0.2], 1.0);

// world
const world = new HittableList();
world.add(new Sphere([0, -100.5, -1], 100, ground));
world.add(new Sphere([0, 0, -1.2], 0.5, center));
world.add(new Sphere([-1, 0, -1], 0.5, left));
world.add(new Sphere([-1, 0, -1], 0.4, bubble));
world.add(new Sphere([1, 0, -1], 0.5, right));

const start = performance.now();
const pixels = await camera.render(world);
const image = await createImage(pixels, camera.imageWidth, imageHeight);
root?.append(image);
const end = performance.now();
console.log(end - start);
