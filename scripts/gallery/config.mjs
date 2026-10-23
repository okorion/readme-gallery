import { readFile } from "node:fs/promises";
import { variants, styles } from "./model.mjs";

export const upstream = "okorion/readme-gallery";
export function resolveConfig(raw, env = process.env) {
  const repository = env.GITHUB_REPOSITORY || env.GALLERY_REPOSITORY || upstream;
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?\/[a-z\d_.-]{1,100}$/i.test(repository))
    throw new Error("Set GALLERY_REPOSITORY to owner/repository (automatic in Actions)");
  const owner = repository.split("/")[0];
  if (!variants.includes(raw.variant) || !styles.includes(raw.style)) throw new Error("Invalid layout or finish");
  if (!["en", "ko"].includes(raw.language)) throw new Error("language must be en or ko");
  if (typeof raw.showSectionLabels !== "boolean") throw new Error("showSectionLabels must be boolean");
  if (!Number.isInteger(raw.maxVisitors) || raw.maxVisitors < 0 || raw.maxVisitors > 9) throw new Error("maxVisitors must be 0..9");
  if (!Number.isInteger(raw.contributionWeeks) || raw.contributionWeeks < 1 || raw.contributionWeeks > 26) throw new Error("contributionWeeks must be 1..26");
  if (typeof raw.portfolioUrl !== "string") throw new Error("portfolioUrl must be a string");
  let portfolioUrl = "";
  if (raw.portfolioUrl) {
    const url = new URL(raw.portfolioUrl);
    if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443"))
      throw new Error("Use a public HTTPS URL without credentials or a custom port");
    if (/^(localhost|.*\.localhost|.*\.local)$/i.test(url.hostname) || /^[\d.]+$|^\[/.test(url.hostname))
      throw new Error("Use a public website hostname");
    portfolioUrl = url.href;
  }
  const capture = raw.capture ?? {};
  for (const key of ["readySelector", "darkToggleSelector", "darkReadySelector"])
    if (capture[key] !== undefined && (typeof capture[key] !== "string" || capture[key].length > 300)) throw new Error(`Invalid capture.${key}`);
  const label = portfolioUrl ? new URL(portfolioUrl).hostname : owner;
  return { ...raw, repository, owner, portfolioUrl, capture, label,
    style: raw.variant === "pavilion" ? "advanced" : raw.style,
    link: portfolioUrl || `https://github.com/${owner}` };
}
export async function loadConfig() {
  return resolveConfig(JSON.parse(await readFile("config/gallery.json", "utf8")));
}
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
