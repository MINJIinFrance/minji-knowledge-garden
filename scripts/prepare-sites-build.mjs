import { copyFile, mkdir } from "node:fs/promises";
import { build } from "esbuild";

await mkdir("dist/server", { recursive: true });
await build({
  entryPoints: ["dist/server/entry.mjs"],
  outfile: "dist/server/index.js",
  bundle: true,
  external: ["cloudflare:workers"],
  format: "esm",
  platform: "browser",
  target: "es2022"
});
await mkdir("dist/.openai", { recursive: true });
await copyFile(".openai/hosting.json", "dist/.openai/hosting.json");
