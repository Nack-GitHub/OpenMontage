// Bundle the atelier composition once, then render one still per requested frame (fast scene review).
// usage: node stills.mjs <entry.tsx> <publicDir> <outDir> <scale> <frame,frame,...>
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [entry, publicDir, outDir, scale, framesCsv] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve(entry), publicDir: path.resolve(publicDir) });
const comp = await selectComposition({ serveUrl, id: "ThailandFacts", inputProps: {} });
const frames = framesCsv.split(",").map(Number);
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(5, "0")}.jpg`);
  await renderStill({ composition: comp, serveUrl, output, frame, scale: Number(scale), imageFormat: "jpeg", jpegQuality: 80, inputProps: {} });
  process.stdout.write(`.${frame}`);
}
fs.rmSync(serveUrl, { recursive: true, force: true });
console.log("\ndone", frames.length);
