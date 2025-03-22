import { $ } from "bun";
import { minify } from "uglify-js";

const formats: Record<string, string> = {
  cjs: "dist/index.js",
  esm: "dist/index.mjs",
  dts: "dist/index.d.ts",
};

await $`tsup src/index.ts --dts --format cjs,esm --minify terser --platform node --target node22 --external util --outDir dist`.quiet();
await $`rm dist/index.d.mts`;
for (const format in formats) {
  if (format === "dts") continue;
  await $`uglifyjs --compress --mangle --module --output ${formats[format]} -- ${formats[format]}`;
}

const KBs: Record<string, number> = {
  cjs: Bun.file(formats.cjs).size / 1024,
  esm: Bun.file(formats.esm).size / 1024,
  dts: Bun.file(formats.dts).size / 1024,
};
for (const file in KBs)
  console.info(`${KBs[file].toFixed(2)} KB - ${formats[file]}`);
