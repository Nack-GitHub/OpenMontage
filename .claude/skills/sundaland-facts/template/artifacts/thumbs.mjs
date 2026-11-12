import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [entry, publicDir, outDir] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve(entry), publicDir: path.resolve(publicDir) });
for (const variant of ["narrow", "durian", "sundaland"]) {
  const comp = await selectComposition({ serveUrl, id: "Thumb", inputProps: { variant } });
  await renderStill({ composition: comp, serveUrl, output: path.join(outDir, `thumb_${variant}.png`), frame: 0, scale: 2 / 3, inputProps: { variant } });
  console.log("ok", variant);
}
