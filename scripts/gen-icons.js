import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, isMaskable = false) {
  // RGBA buffer with filter byte per row
  const rowLength = width * 4 + 1;
  const rawData = Buffer.alloc(rowLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = (width / 2) * (isMaskable ? 0.72 : 0.88);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default dark cyber studio background
      let r = 3, g = 3, b = 14, a = 255;

      if (!isMaskable && dist > width / 2 - 2) {
        // Transparent outside rounded corner for standard icon
        a = 0;
      } else {
        // Glowing cyan/violet radial gradient
        const t = Math.min(1, dist / outerR);
        // Cyberpunk colors: #00f5ff (0, 245, 255) to #8b5cf6 (139, 92, 246)
        const cr = Math.floor(0 * (1 - t) + 139 * t);
        const cg = Math.floor(245 * (1 - t) + 92 * t);
        const cb = Math.floor(255 * (1 - t) + 246 * t);

        // Center equalizer bars simulation
        const nx = (x - cx) / (outerR * 0.7);
        const ny = (y - cy) / (outerR * 0.7);

        // Check if inside one of 5 vertical bars
        const inBar = [-0.6, -0.3, 0, 0.3, 0.6].some((barX, i) => {
          const barH = [0.4, 0.7, 0.95, 0.7, 0.4][i];
          return Math.abs(nx - barX) < 0.08 && Math.abs(ny) < barH;
        });

        if (inBar) {
          r = 0;
          g = 245;
          b = 255;
          a = 255;
        } else if (Math.abs(dist - outerR) < (width * 0.03)) {
          // Ring
          r = cr;
          g = cg;
          b = cb;
          a = 220;
        } else {
          // Background ambient fill
          r = Math.floor(r * 0.9 + cr * 0.1);
          g = Math.floor(g * 0.9 + cg * 0.1);
          b = Math.floor(b * 0.9 + cb * 0.1);
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Deflate IDAT
  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // Helper to make chunk
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit depth
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // Deflate compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Non-interlaced

  const ihdr = chunk('IHDR', ihdrData);
  const idat = chunk('IDAT', compressedData);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// CRC-32 table calculation
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

// Generate icons
fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, false));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, false));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, false));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, true));
console.log('Successfully generated compliant PWA icons in /public!');
