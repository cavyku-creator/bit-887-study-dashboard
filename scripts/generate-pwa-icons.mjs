import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "public", "icons");

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    scanlines[rowStart] = 0;
    pixels.copy(scanlines, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(scanlines, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function hexToRgba(hex) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
    255
  ];
}

function setPixel(pixels, width, x, y, color) {
  if (x < 0 || x >= width || y < 0) return;
  const offset = (y * width + x) * 4;
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
  pixels[offset + 3] = color[3];
}

function fillRect(pixels, width, height, x, y, rectWidth, rectHeight, color) {
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(width, Math.ceil(x + rectWidth));
  const endY = Math.min(height, Math.ceil(y + rectHeight));
  for (let py = startY; py < endY; py += 1) {
    for (let px = startX; px < endX; px += 1) {
      setPixel(pixels, width, px, py, color);
    }
  }
}

function fillRoundedRect(pixels, width, height, x, y, rectWidth, rectHeight, radius, color) {
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(width, Math.ceil(x + rectWidth));
  const endY = Math.min(height, Math.ceil(y + rectHeight));

  for (let py = startY; py < endY; py += 1) {
    for (let px = startX; px < endX; px += 1) {
      const left = px - x;
      const right = x + rectWidth - px - 1;
      const top = py - y;
      const bottom = y + rectHeight - py - 1;
      const dx = Math.max(radius - left, radius - right, 0);
      const dy = Math.max(radius - top, radius - bottom, 0);
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(pixels, width, px, py, color);
      }
    }
  }
}

function drawCheck(pixels, width, scale, color) {
  const points = [
    [70, 105],
    [90, 126],
    [129, 76]
  ].map(([x, y]) => [x * scale, y * scale]);

  for (let i = 0; i < points.length - 1; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1));
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      fillRoundedRect(pixels, width, width, x - 4 * scale, y - 4 * scale, 8 * scale, 8 * scale, 4 * scale, color);
    }
  }
}

function drawIcon(size, maskable = false) {
  const pixels = Buffer.alloc(size * size * 4);
  const scale = size / 192;
  const accent = hexToRgba("#256f68");
  const accentDark = hexToRgba("#1f5c57");
  const paper = hexToRgba("#f7f5f0");
  const panel = hexToRgba("#ffffff");
  const line = hexToRgba("#dcd7ce");

  fillRect(pixels, size, size, 0, 0, size, size, maskable ? accent : paper);
  fillRoundedRect(pixels, size, size, 18 * scale, 18 * scale, 156 * scale, 156 * scale, 28 * scale, maskable ? panel : accent);
  fillRoundedRect(pixels, size, size, 42 * scale, 47 * scale, 108 * scale, 98 * scale, 10 * scale, maskable ? accent : panel);
  fillRect(pixels, size, size, 42 * scale, 66 * scale, 108 * scale, 8 * scale, maskable ? accentDark : line);
  fillRoundedRect(pixels, size, size, 60 * scale, 35 * scale, 10 * scale, 25 * scale, 5 * scale, maskable ? accentDark : accent);
  fillRoundedRect(pixels, size, size, 122 * scale, 35 * scale, 10 * scale, 25 * scale, 5 * scale, maskable ? accentDark : accent);
  drawCheck(pixels, size, scale, maskable ? panel : accent);

  return encodePng(size, size, pixels);
}

mkdirSync(outDir, { recursive: true });

writeFileSync(join(outDir, "icon-192.png"), drawIcon(192));
writeFileSync(join(outDir, "icon-512.png"), drawIcon(512));
writeFileSync(join(outDir, "maskable-192.png"), drawIcon(192, true));
writeFileSync(join(outDir, "maskable-512.png"), drawIcon(512, true));
writeFileSync(join(outDir, "apple-touch-icon.png"), drawIcon(180));
