import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const RATE = 16000;
const SECONDS = 1.2;
const samples = Math.floor(RATE * SECONDS);
const pcm = Buffer.alloc(samples * 2);
for (let i = 0; i < samples; i++) {
  const t = i / RATE;
  const env = Math.min(1, t * 8) * Math.min(1, (SECONDS - t) * 8);
  const s = Math.sin(2 * Math.PI * 440 * t) * 0.25 * env;
  pcm.writeInt16LE(Math.round(s * 0x7fff), i * 2);
}

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(RATE, 24);
header.writeUInt32LE(RATE * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);

const dir = join(process.cwd(), "fixtures");
mkdirSync(dir, { recursive: true });
const path = join(dir, "tone-440.wav");
writeFileSync(path, Buffer.concat([header, pcm]));
console.log(`wrote ${path} (${samples} samples)`);
