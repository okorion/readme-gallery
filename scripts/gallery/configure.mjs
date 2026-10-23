import { readFile, writeFile } from "node:fs/promises";
import { resolveConfig } from "./config.mjs";
const raw = JSON.parse(await readFile("config/gallery.json", "utf8"));
for (const [env, key] of [["INPUT_VARIANT", "variant"], ["INPUT_STYLE", "style"], ["INPUT_LANGUAGE", "language"]]) {
  const value = process.env[env];
  if (value && value !== "keep") raw[key] = value;
}
const url = process.env.INPUT_WEBSITE?.trim();
if (url) raw.portfolioUrl = url === "none" ? "" : url;
if (raw.variant === "pavilion") raw.style = "advanced";
resolveConfig(raw);
await writeFile("config/gallery.json", JSON.stringify(raw, null, 2) + "\n");
