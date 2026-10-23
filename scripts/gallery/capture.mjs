import { lookup } from "node:dns/promises";
import { writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { escapeHtml } from "./config.mjs";

export function isPublicAddress(address) {
  if (address.includes(":")) return /^[23][\da-f]{3}:/i.test(address) && !/^2001:(db8|0):/i.test(address);
  const [a,b] = address.split(".").map(Number);
  return a > 0 && a < 224 && a !== 10 && a !== 127 && !(a === 169 && b === 254) &&
    !(a === 172 && b >= 16 && b <= 31) && !(a === 192 && (b === 168 || b === 0)) &&
    !(a === 100 && b >= 64 && b <= 127) && !(a === 198 && (b === 18 || b === 19));
}
export function profileHtml(config, dark) {
  const ko = config.language === "ko";
  return `<!doctype html><html lang="${ko ? "ko" : "en"}"><meta charset="utf-8"><title>${escapeHtml(config.owner)}</title>
<style>@font-face{font-family:Pretendard;src:url('/font.woff2');font-weight:100 900}*{box-sizing:border-box}body{margin:0;background:${dark ? "#111923" : "#fff"};color:${dark ? "#e7edf6" : "#172436"};font-family:Pretendard,sans-serif;padding:100px 92px}header{font-size:20px;letter-spacing:.18em;color:#7599e4}h1{font-size:clamp(38px,6vw,72px);font-weight:650;letter-spacing:-.045em;margin:55px 0 22px;overflow-wrap:anywhere;line-height:1.12}p{font-size:30px;color:${dark ? "#b2bfd2" : "#64758b"};line-height:1.5}footer{margin-top:72px;border-top:1px solid ${dark ? "#2c3748" : "#e2e7ee"};padding-top:26px;font-size:22px;color:#7295dc}</style>
<header>GITHUB / ${ko ? "개인 전시관" : "PERSONAL EXHIBITION"}</header><h1>${escapeHtml(config.owner)}</h1><p>${ko ? "프로젝트와 아이디어를 만나보세요." : "Projects, ideas, and things I make."}</p><footer>github.com/${escapeHtml(config.owner)} ↗</footer></html>`;
}
export async function capture(browser, config, origin) {
  // A fresh, unauthenticated browser context. API credentials remain in Node.
  const context = await browser.newContext({ viewport: { width: 1184, height: 760 }, deviceScaleFactor: 1,
    colorScheme: "light", locale: config.language === "ko" ? "ko-KR" : "en-US", reducedMotion: "reduce", serviceWorkers: "block" });
  try {
    if (config.portfolioUrl) {
      const hosts = new Map();
      await context.route("**/*", async route => {
        try {
          const url = new URL(route.request().url());
          if (url.protocol === "data:" || url.protocol === "blob:") return route.continue();
          if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) return route.abort();
          if (!hosts.has(url.hostname)) hosts.set(url.hostname, lookup(url.hostname, { all: true }).then(items => items.length > 0 && items.every(x => isPublicAddress(x.address))).catch(() => false));
          if (!(await hosts.get(url.hostname))) return route.abort();
          await route.continue();
        } catch { await route.abort().catch(() => {}); }
      });
    }
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    const fonts = {};
    for (const theme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme: theme });
      if (theme === "dark" && config.portfolioUrl && config.capture.darkToggleSelector) {
        await page.locator(config.capture.darkToggleSelector).click();
        if (config.capture.darkReadySelector) await page.locator(config.capture.darkReadySelector).waitFor();
      } else {
        const response = await page.goto(config.portfolioUrl || `${origin}/profile?theme=${theme}`, { waitUntil: "load", timeout: 60000 });
        if (!response?.ok()) throw new Error(`Website capture returned HTTP ${response?.status()}`);
      }
      if (config.capture.readySelector && config.portfolioUrl) await page.locator(config.capture.readySelector).waitFor();
      await page.waitForFunction(() => document.fonts.status === "loaded");
      await page.evaluate(() => Promise.all([...document.images].map(image => image.decode().catch(() => {}))));
      // Two settled animation frames let font layout and CSS theme changes paint.
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      fonts[theme] = await page.evaluate(() => [...document.fonts].filter(f => f.status === "loaded").map(f => f.family));
      await page.screenshot({ path: `assets/gallery/portfolio${theme === "dark" ? "-dark" : ""}.png`, animations: "disabled" });
    }
    const sha = async path => createHash("sha256").update(await readFile(path)).digest("hex");
    await writeFile("assets/gallery/source.json", JSON.stringify({
      mode: config.portfolioUrl ? "website" : "profile-card", url: config.link, owner: config.owner,
      viewport: { width: 1184, height: 760 }, loadedFonts: fonts,
      sha256: await sha("assets/gallery/portfolio.png"), darkSha256: await sha("assets/gallery/portfolio-dark.png"),
    }, null, 2) + "\n");
  } finally { await context.close(); }
}
