import sharp from "sharp";
import { readFileSync } from "fs";

const svg = readFileSync("icon.svg");
for (const size of [192, 512]) {
  await sharp(svg, { density: 300 }).resize(size, size).png().toFile(`public/icon-${size}.png`);
}