/**
 * @param ppm file .ppm
 * @returns image in canvas format
 */
export const createImage = (ppm: string) => {
    const DIMS_OFFSET = 1; // which line to get dims from .ppm
    const TRIP_OFFSET = 3; // which line the data starts in .ppm

    const entries = ppm.split("\n").filter(line => !line.startsWith("#"));
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
}
