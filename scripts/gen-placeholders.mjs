import { writeFileSync, mkdirSync } from "node:fs";

mkdirSync("public/placeholders", { recursive: true });

const RED = "#C81010";
const GOLD = "#E5E5E5"; // paleta oficial: stone gray (sin dorado)
const BONE = "#F4F4F4";
const INK = "#0D0D0D";

// Producto cuadrado 600x600
function product(n) {
  const accent = n % 2 === 0 ? GOLD : RED;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <radialGradient id="g${n}" cx="50%" cy="42%" r="60%">
      <stop offset="0%" stop-color="#1c1c1c"/>
      <stop offset="100%" stop-color="${INK}"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g${n})"/>
  <circle cx="300" cy="250" r="150" fill="${accent}" opacity="0.16"/>
  <circle cx="300" cy="250" r="150" fill="none" stroke="${accent}" stroke-width="3" opacity="0.5"/>
  <text x="300" y="300" font-family="serif" font-size="190" fill="${accent}" text-anchor="middle" opacity="0.85">鬼</text>
  <text x="300" y="470" font-family="Arial, sans-serif" font-weight="800" font-size="44" letter-spacing="6" fill="${BONE}" text-anchor="middle">ONISTORE</text>
  <text x="300" y="515" font-family="Arial, sans-serif" font-size="22" letter-spacing="3" fill="${accent}" text-anchor="middle">PRODUCTO ${n}</text>
</svg>`;
}

// Hero ancho 1600x900
function hero(n) {
  const accent = RED;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="h${n}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#161616"/>
      <stop offset="100%" stop-color="${INK}"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#h${n})"/>
  <circle cx="1200" cy="430" r="320" fill="${accent}" opacity="0.18"/>
  <circle cx="1200" cy="430" r="320" fill="none" stroke="${accent}" stroke-width="4" opacity="0.45"/>
  <text x="1200" y="560" font-family="serif" font-size="420" fill="${accent}" text-anchor="middle" opacity="0.75">鬼</text>
</svg>`;
}

for (let n = 1; n <= 6; n++) writeFileSync(`public/placeholders/p${n}.svg`, product(n));
writeFileSync("public/placeholders/hero1.svg", hero(1, "DESPIERTA TU LADO ONI"));
writeFileSync("public/placeholders/hero2.svg", hero(2, "ZONA CHANCADITOS"));
writeFileSync("public/placeholders/hero3.svg", hero(3, "LIVE ONISTORE"));
writeFileSync("public/placeholders/og.svg", hero(1, "TIENDA OTAKU"));

console.log("✅ placeholders generados");
