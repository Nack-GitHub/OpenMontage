// Chunked full render (avoids Remotion's large-audio-mixing path that failed on Windows).
// usage: node render_chunks_sea.mjs <entry> <publicDir> <outDir> <chunkFrames> [concurrency] [startChunk]
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [entry, publicDir, outDir, chunkStr = "3600", conc = "6", startStr = "0"] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: path.resolve(entry), publicDir: path.resolve(publicDir) });
const chromiumOptions = { gl: "angle" };
const composition = await selectComposition({ serveUrl, id: "SEABrokeFirst", inputProps: {}, chromiumOptions });
const N = composition.durationInFrames, C = Number(chunkStr);
const chunks = []; for (let a = 0; a < N; a += C) chunks.push([a, Math.min(N - 1, a + C - 1)]);
console.log("frames", N, "chunks", chunks.length);
for (let i = Number(startStr); i < chunks.length; i++) {
  const out = path.join(outDir, `chunk_${String(i).padStart(2, "0")}.mkv`);
  if (fs.existsSync(out) && fs.statSync(out).size > 1e6) { console.log("skip", out); continue; }
  const tmp = out + ".part.mkv";
  await renderMedia({ composition, serveUrl, codec: "h264-mkv", audioCodec: "pcm-16", crf: 18, frameRange: chunks[i], outputLocation: tmp,
    chromiumOptions, inputProps: {}, concurrency: Number(conc), timeoutInMilliseconds: 180000 });
  fs.renameSync(tmp, out);
  console.log(`chunk ${i + 1}/${chunks.length} done · ${Math.round((Date.now() - t0) / 1000)} s`);
}
console.log("ALLDONE", Math.round((Date.now() - t0) / 1000), "s");
