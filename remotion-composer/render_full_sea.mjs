// Full render with WebGL (ANGLE) for the @remotion/three story objects.
// usage: node render_full_sea.mjs <entry> <publicDir> <out.mp4> [concurrency]
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [entry, publicDir, out, conc = "6"] = process.argv.slice(2);
const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: path.resolve(entry), publicDir: path.resolve(publicDir) });
const chromiumOptions = { gl: "angle" };
const composition = await selectComposition({ serveUrl, id: "SEABrokeFirst", inputProps: {}, chromiumOptions });
let last = -1;
await renderMedia({
  composition, serveUrl, codec: "h264", crf: 18, outputLocation: out, chromiumOptions, inputProps: {},
  concurrency: Number(conc), timeoutInMilliseconds: 180000,
  onProgress: ({ progress }) => { const p = Math.floor(progress * 100); if (p !== last && p % 5 === 0) { last = p; console.log(`progress ${p}% · ${Math.round((Date.now() - t0) / 1000)} s`); } },
});
console.log("DONE", out, Math.round((Date.now() - t0) / 1000), "s");
