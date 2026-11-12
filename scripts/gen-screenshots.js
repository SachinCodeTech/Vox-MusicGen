import fs from 'fs';
import zlib from 'zlib';

function createScreenshotPNG(width, height, isNarrow = false) {
  const rowLength = width * 4 + 1;
  const rawData = Buffer.alloc(rowLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0;

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Dark cyber daw background gradient (#03030e to #080918)
      const gradT = y / height;
      let r = Math.floor(3 * (1 - gradT) + 10 * gradT);
      let g = Math.floor(3 * (1 - gradT) + 12 * gradT);
      let b = Math.floor(14 * (1 - gradT) + 30 * gradT);
      let a = 255;

      // Top bar header mockup area
      if (y < (isNarrow ? 120 : 70)) {
        r = 12; g = 14; b = 32;
      }
      
      // Bottom navigation / transport bar mockup area
      if (y > height - (isNarrow ? 140 : 80)) {
        r = 8; g = 9; b = 24;
      }

      // Waveform center band mockup
      const centerY = height * 0.45;
      const waveH = Math.sin(x * 0.03) * Math.sin(x * 0.008) * (isNarrow ? 120 : 90);
      if (Math.abs(y - centerY) < Math.abs(waveH)) {
        // Neon cyan #00f5ff / violet #8b5cf6
        const waveT = (x / width);
        r = Math.floor(0 * (1 - waveT) + 139 * waveT);
        g = Math.floor(245 * (1 - waveT) + 92 * waveT);
        b = Math.floor(255 * (1 - waveT) + 246 * waveT);
      }

      // Multitrack stem lanes mockup
      const laneStartY = height * 0.6;
      if (y > laneStartY && y < height - (isNarrow ? 160 : 100)) {
        const laneIdx = Math.floor((y - laneStartY) / (isNarrow ? 70 : 45));
        if (laneIdx < 4) {
          const inBar = (x % (isNarrow ? 90 : 140)) < (isNarrow ? 60 : 100);
          if (inBar && ((y - laneStartY) % (isNarrow ? 70 : 45) > 10)) {
            const laneColors = [
              [0, 245, 255],  // drums
              [139, 92, 246], // synth
              [244, 114, 182],// vocal
              [16, 255, 176]  // ambient
            ];
            const lc = laneColors[laneIdx % 4];
            r = lc[0]; g = lc[1]; b = lc[2];
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

if (!fs.existsSync('public/screenshots')) {
  fs.mkdirSync('public/screenshots', { recursive: true });
}

// Generate Mobile (narrow) and Desktop (wide) store screenshots
fs.writeFileSync('public/screenshots/mobile-preview.png', createScreenshotPNG(750, 1334, true));
fs.writeFileSync('public/screenshots/desktop-preview.png', createScreenshotPNG(1280, 720, false));

console.log('Successfully generated store screenshots in /public/screenshots!');
