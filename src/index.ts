import './index.css';
import { createImage } from './utils';

const root = document.querySelector('#root');

// create ppm header
const width = 256;
const height = 256;
let ppm = `P3\n${width} ${height}\n0255\n`

// create ppm image
for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
        const ir = col / (width - 1);
        const ig = row / (height - 1);
        const ib = 0;
        const r = Math.floor(ir * 255);
        const g = Math.floor(ig * 255);
        const b = Math.floor(ib * 255);
        ppm += `${r} ${g} ${b}\n`;
    }
}

const image = createImage(ppm);
root?.append(image);
