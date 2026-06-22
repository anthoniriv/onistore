import { Jimp } from "jimp";
import { mkdirSync } from "node:fs";

mkdirSync("public/brand", { recursive: true });

const img = await Jimp.read("ICON.png");
const { data, width: W, height: H } = img.bitmap;
const idx = (x, y) => (y * W + x) * 4;
const isWhite = (i) => data[i] > 232 && data[i + 1] > 232 && data[i + 2] > 232;

// 1) Pintar de blanco la franja superior (label "3. ICON-ONLY MARK" + línea roja)
for (let y = 0; y < Math.floor(H * 0.16); y++)
  for (let x = 0; x < W; x++) {
    const i = idx(x, y);
    data[i] = data[i + 1] = data[i + 2] = 255;
    data[i + 3] = 255;
  }

// 2) Floodfill de blanco desde los bordes → transparente (conserva la cara interior)
const seen = new Uint8Array(W * H);
const stack = [];
const seed = (x, y) => {
  const p = y * W + x;
  if (!seen[p]) { seen[p] = 1; stack.push(p); }
};
for (let x = 0; x < W; x++) { seed(x, 0); seed(x, H - 1); }
for (let y = 0; y < H; y++) { seed(0, y); seed(W - 1, y); }

while (stack.length) {
  const p = stack.pop();
  const i = p * 4;
  if (!isWhite(i)) continue;
  data[i + 3] = 0; // transparente
  const x = p % W, y = (p / W) | 0;
  if (x > 0) seed(x - 1, y);
  if (x < W - 1) seed(x + 1, y);
  if (y > 0) seed(x, y - 1);
  if (y < H - 1) seed(x, y + 1);
}

// 3) Bounding box de lo no-transparente
let minX = W, minY = H, maxX = 0, maxY = 0;
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    if (data[idx(x, y) + 3] > 10) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
const pad = 12;
minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
img.crop({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });

// 4) Guardar full + versión chica
await img.clone().resize({ w: 512 }).write("public/brand/oni-icon.png");
await img.clone().resize({ w: 64 }).write("public/brand/favicon.png");

console.log(`✅ ícono extraído (${maxX - minX + 1}×${maxY - minY + 1}) -> public/brand/oni-icon.png`);
