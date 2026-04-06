/**
 * Generate PWA icons from SVG source.
 * Run: node scripts/generate-icons.js
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const ICONS_DIR = path.join(PUBLIC, "icons");

// Icon SVG without text (for small icons) — shield + bolt, teal theme
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#030712"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="teal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#5eead4"/>
      <stop offset="100%" stop-color="#14b8a6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="160" fill="none" stroke="#2dd4bf" stroke-width="6" opacity="0.15"/>
  <path d="M256 80 L360 150 L360 290 C360 360 316 400 256 430 C196 400 152 360 152 290 L152 150 Z" fill="none" stroke="url(#teal)" stroke-width="10"/>
  <path d="M275 165 L240 265 L275 265 L245 355 L310 240 L272 240 Z" fill="url(#teal)"/>
</svg>`;

// Maskable icon — padded for safe zone
const MASKABLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#030712"/>
  <g transform="translate(76, 76) scale(0.7)">
    <defs>
      <linearGradient id="teal2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#5eead4"/>
        <stop offset="100%" stop-color="#14b8a6"/>
      </linearGradient>
    </defs>
    <circle cx="256" cy="256" r="160" fill="none" stroke="#2dd4bf" stroke-width="6" opacity="0.15"/>
    <path d="M256 80 L360 150 L360 290 C360 360 316 400 256 430 C196 400 152 360 152 290 L152 150 Z" fill="none" stroke="url(#teal2)" stroke-width="10"/>
    <path d="M275 165 L240 265 L275 265 L245 355 L310 240 L272 240 Z" fill="url(#teal2)"/>
  </g>
</svg>`;

async function generate() {
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  const svgBuffer = Buffer.from(ICON_SVG);
  const maskableBuffer = Buffer.from(MASKABLE_SVG);

  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(ICONS_DIR, "icon-192x192.png"));
  console.log("✅ icon-192x192.png");

  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(ICONS_DIR, "icon-512x512.png"));
  console.log("✅ icon-512x512.png");

  await sharp(maskableBuffer).resize(192, 192).png().toFile(path.join(ICONS_DIR, "icon-maskable-192x192.png"));
  console.log("✅ icon-maskable-192x192.png");

  await sharp(maskableBuffer).resize(512, 512).png().toFile(path.join(ICONS_DIR, "icon-maskable-512x512.png"));
  console.log("✅ icon-maskable-512x512.png");

  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(PUBLIC, "apple-touch-icon.png"));
  console.log("✅ apple-touch-icon.png");

  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(PUBLIC, "favicon.ico"));
  console.log("✅ favicon.ico");

  await sharp(svgBuffer).resize(16, 16).png().toFile(path.join(ICONS_DIR, "icon-16x16.png"));
  console.log("✅ icon-16x16.png");

  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(ICONS_DIR, "icon-32x32.png"));
  console.log("✅ icon-32x32.png");

  console.log("\n🎉 All PWA icons generated!");
}

generate().catch(console.error);
