// usage: node preview_sea.mjs <entry> <publicDir> <out.mp4> <from> <to> <scale>
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [entry, publicDir, out, from, to, scale] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve(entry), publicDir: path.resolve(publicDir) });
const chromiumOptions = { gl: "angle" };
const composition = await selectComposition({ serveUrl, id: "SEABrokeFirst", inputProps: {}, chromiumOptions });
await renderMedia({ composition, serveUrl, codec: "h264", outputLocation: out, frameRange: [Number(from), Number(to)], scale: Number(scale), chromiumOptions, inputProps: {}, concurrency: 4 });
console.log("done", out);
