// usage: node thumbs.mjs <entry> <publicDir> <outDir>  → thumb_<variant>.png (1280×720)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [entry, publicDir, outDir] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve(entry), publicDir: path.resolve(publicDir) });
const chromiumOptions = { gl: "angle" };
for (const variant of ["map", "clock", "doodle"]) {
  const comp = await selectComposition({ serveUrl, id: "Thumb", inputProps: { variant }, chromiumOptions });
  await renderStill({ composition: comp, serveUrl, output: path.join(outDir, `thumb_${variant}.png`), frame: 0, scale: 2 / 3, inputProps: { variant }, chromiumOptions });
  console.log("ok", variant);
}
