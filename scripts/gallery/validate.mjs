import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { loadConfig } from "./config.mjs";
import { validateData, assetName } from "./model.mjs";
import { start, end } from "./readme.mjs";
const config = await loadConfig();
const data = validateData(JSON.parse(await readFile("assets/gallery/data.json", "utf8")));
if (data.demo && process.env.CI) throw new Error("Demo data cannot be published as live activity");
const name = assetName(config.variant, config.style);
for (const mobile of [false, true]) for (const theme of ["light", "dark"]) {
  const file = `assets/gallery/${name}${mobile ? "-mobile" : ""}-${theme}.png`;
  const bytes = await readFile(file);
  if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" || bytes.length < 10000 || bytes.length > 3000000 ||
      bytes.readUInt32BE(16) !== (mobile ? 900 : 1600) || bytes.readUInt32BE(20) !== (mobile ? 900 : 700))
    throw new Error(`Invalid output: ${file}`);
}
const source = JSON.parse(await readFile("assets/gallery/source.json", "utf8"));
for (const [file, key] of [["portfolio.png", "sha256"], ["portfolio-dark.png", "darkSha256"]]) {
  const hash = createHash("sha256").update(await readFile(`assets/gallery/${file}`)).digest("hex");
  if (source[key] !== hash) throw new Error("Website capture hash mismatch");
}
if (source.url !== config.link || source.owner !== config.owner) throw new Error("Capture identity is stale");
const font = await readFile("assets/fonts/PretendardVariable.woff2");
if (createHash("sha256").update(font).digest("hex") !== "9599f12fd42fc0bce1cd50b47a0c022e108d7aa64dd0d1bb0ed44f3282d900b4") throw new Error("Bundled font differs from Pretendard 1.3.9");
const readme = await readFile("README.md", "utf8");
if (readme.split(start).length !== 2 || readme.split(end).length !== 2 || !readme.includes(`./assets/gallery/${name}-light.png`)) throw new Error("README gallery is missing or stale");
if (config.maxVisitors && !readme.includes(`https://github.com/${config.repository}/issues/new?template=gallery.yml`)) throw new Error("Visitor link targets the wrong repository");
console.log(`Validated ${config.repository}: ${name}, desktop/mobile, light/dark, capture hashes and font`);
