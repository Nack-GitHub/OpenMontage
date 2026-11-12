// Render ONLY the audio mix of the composition (narration + music + SFX) to WAV — for music swaps without re-rendering video.
// usage (from remotion-composer/): node _audio_tmp.mjs <entry.tsx> <publicDir> <out.wav>
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [entry, publicDir, out] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve(entry), publicDir: path.resolve(publicDir) });
const composition = await selectComposition({ serveUrl, id: "ThailandFacts", inputProps: {} });
await renderMedia({ composition, serveUrl, codec: "wav", outputLocation: path.resolve(out), inputProps: {}, concurrency: 6,
  onProgress: ({ progress }) => { if (Math.round(progress * 100) % 10 === 0) process.stdout.write(`${Math.round(progress * 100)}% `); } });
fs.rmSync(serveUrl, { recursive: true, force: true });
console.log("\ndone", out);
