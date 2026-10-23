import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { assetName } from "./model.mjs";
import { loadConfig, escapeHtml, upstream } from "./config.mjs";

export const start = "<!-- readme-gallery:start -->";
export const end = "<!-- readme-gallery:end -->";
export function galleryBlock(config) {
  const name = assetName(config.variant, config.style);
  const ko = config.language === "ko";
  const src = (suffix) => `./assets/gallery/${name}${suffix}.png`;
  return `${start}
<a href="${escapeHtml(config.link)}">
  <picture>
    <source media="(prefers-color-scheme: dark) and (max-width: 600px)" srcset="${src("-mobile-dark")}" />
    <source media="(max-width: 600px)" srcset="${src("-mobile-light")}" />
    <source media="(prefers-color-scheme: dark)" srcset="${src("-dark")}" />
    <img alt="${ko ? "프로필 화면, GitHub 활동 지형, 방문자 작품으로 구성한 전시관" : "An exhibition of my profile, GitHub contributions and visitor artworks"}" src="${src("-light")}" width="100%" />
  </picture>
</a>

<a href="${escapeHtml(config.link)}">${ko ? "둘러보기 ↗" : "Explore ↗"}</a>${config.maxVisitors ? ` · <a href="https://github.com/${config.repository}/issues/new?template=gallery.yml">${ko ? "오브젝트 남기기 +" : "Leave an object +"}</a>` : ""}

<sub>Created with <a href="https://github.com/${upstream}">README Gallery</a> by <a href="https://github.com/okorion">okorion</a>.</sub>
${end}`;
}
export function updateReadme(text, block) {
  const a = text.split(start).length - 1, b = text.split(end).length - 1;
  if (!a && !b) return text + (text.endsWith("\n\n") || !text ? "" : "\n\n") + block + "\n";
  if (a !== 1 || b !== 1 || text.indexOf(start) > text.indexOf(end)) throw new Error("README gallery markers are malformed; restore one start/end pair");
  return text.slice(0, text.indexOf(start)) + block + text.slice(text.indexOf(end) + end.length);
}
export async function writeReadme() {
  const config = await loadConfig();
  let text = await readFile("README.md", "utf8").catch(e => { if (e.code === "ENOENT") return ""; throw e; });
  // Only the exact, unedited template guide is removed in a new user's copy.
  // Any custom text outside the managed block is retained byte for byte.
  if (config.repository.toLowerCase() !== upstream) {
    const guide = await readFile("docs/template-guide.md", "utf8");
    if (text.endsWith(guide)) text = text.slice(0, -guide.length);
  }
  await writeFile("README.md", updateReadme(text, galleryBlock(config)));
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) await writeReadme();
