import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, mode = 'standard') {
  // mode: 'standard' | 'maskable' | 'monochrome'
  const rowLength = width * 4 + 1;
  const rawData = Buffer.alloc(rowLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = (width / 2) * (mode === 'maskable' ? 0.72 : 0.84);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 0, g = 0, b = 0, a = 0;

      if (mode === 'monochrome') {
        // MONOCHROME (Pure white silhouette on transparent background)
        // Suitable for Android 13+ Material You themed icons & Windows badges
        const nx = (x - cx) / (outerR * 0.7);
        const ny = (y - cy) / (outerR * 0.7);

        // 5 Equalizer bars
        const inBar = [-0.6, -0.3, 0, 0.3, 0.6].some((barX, i) => {
          const barH = [0.4, 0.7, 0.95, 0.7, 0.4][i];
          return Math.abs(nx - barX) < 0.08 && Math.abs(ny) < barH;
        });

        // Outer ring
        const inRing = Math.abs(dist - outerR) < (width * 0.035);

        // Center dot
        const inCenterDot = dist < (width * 0.04);

        if (inBar || inRing || inCenterDot) {
          r = 255;
          g = 255;
          b = 255;
          a = 255;
        } else {
          a = 0; // transparent
        }
      } else {
        // Standard colored cyber studio icon
        if (mode !== 'maskable' && dist > width / 2 - 2) {
          a = 0;
        } else {
          r = 3; g = 3; b = 14; a = 255;
          const t = Math.min(1, dist / outerR);
          const cr = Math.floor(0 * (1 - t) + 139 * t);
          const cg = Math.floor(245 * (1 - t) + 92 * t);
          const cb = Math.floor(255 * (1 - t) + 246 * t);

          const nx = (x - cx) / (outerR * 0.7);
          const ny = (y - cy) / (outerR * 0.7);

          const inBar = [-0.6, -0.3, 0, 0.3, 0.6].some((barX, i) => {
            const barH = [0.4, 0.7, 0.95, 0.7, 0.4][i];
            return Math.abs(nx - barX) < 0.08 && Math.abs(ny) < barH;
          });

          if (inBar) {
            r = 0; g = 245; b = 255; a = 255;
          } else if (Math.abs(dist - outerR) < (width * 0.03)) {
            r = cr; g = cg; b = cb; a = 220;
          } else {
            r = Math.floor(r * 0.9 + cr * 0.1);
            g = Math.floor(g * 0.9 + cg * 0.1);
            b = Math.floor(b * 0.9 + cb * 0.1);
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdr = chunk('IHDR', ihdrData);
  const idat = chunk('IDAT', compressedData);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[i] = c;
}

// 1. Generate Monochrome Icons for Android Material You & Windows Badges
fs.writeFileSync('public/pwa-monochrome-512x512.png', createPNG(512, 512, 'monochrome'));
fs.writeFileSync('public/pwa-monochrome-192x192.png', createPNG(192, 192, 'monochrome'));

// 2. Generate Favicons
fs.writeFileSync('public/favicon-32x32.png', createPNG(32, 32, 'standard'));
fs.writeFileSync('public/favicon-16x16.png', createPNG(16, 16, 'standard'));

// 3. Generate Windows 10/11 Start Tile Icon
fs.writeFileSync('public/mstile-150x150.png', createPNG(150, 150, 'standard'));

// 4. Generate Safari Pinned Tab SVG (Monochrome Vector)
const safariPinnedTabSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <circle cx="256" cy="256" r="210" fill="none" stroke="black" stroke-width="24" />
  <g stroke="black" stroke-width="28" stroke-linecap="round">
    <line x1="148" y1="210" x2="148" y2="302" />
    <line x1="202" y1="160" x2="202" y2="352" />
    <line x1="256" y1="110" x2="256" y2="402" />
    <line x1="310" y1="160" x2="310" y2="352" />
    <line x1="364" y1="210" x2="364" y2="302" />
  </g>
</svg>`;
fs.writeFileSync('public/safari-pinned-tab.svg', safariPinnedTabSvg);

console.log('Successfully generated monochrome icons and all platform-specific assets in /public!');
