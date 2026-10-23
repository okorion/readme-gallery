import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile, copyFile } from "node:fs/promises";
import { loadConfig } from "./config.mjs";
import { capture, profileHtml } from "./capture.mjs";
import { variants, stylesFor, assetName, validateData } from "./model.mjs";

const config = await loadConfig();
await mkdir("assets/gallery", { recursive: true });
validateData(JSON.parse(await readFile("assets/gallery/data.json", "utf8")));
const root = new URL("../../", import.meta.url);
const routes = new Map([
  ["/", ["scripts/gallery/scene.html", "text/html"]],
  ["/scene.mjs", ["scripts/gallery/scene.mjs", "text/javascript"]],
  ["/font.woff2", ["assets/fonts/PretendardVariable.woff2", "font/woff2"]],
  [
    "/RoundedBoxGeometry.mjs",
    [
      "node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js",
      "text/javascript",
    ],
  ],
  [
    "/RoomEnvironment.mjs",
    [
      "node_modules/three/examples/jsm/environments/RoomEnvironment.js",
      "text/javascript",
    ],
  ],
  [
    "/three.mjs",
    ["node_modules/three/build/three.module.js", "text/javascript"],
  ],
  [
    "/three.core.js",
    ["node_modules/three/build/three.core.js", "text/javascript"],
  ],
  ["/data.json", ["assets/gallery/data.json", "application/json"]],
  ["/portfolio.png", ["assets/gallery/portfolio.png", "image/png"]],
  ["/portfolio-dark.png", ["assets/gallery/portfolio-dark.png", "image/png"]],
]);
const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/config.json") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ label: config.label, language: config.language })); return;
  }
  if (url.pathname === "/profile") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(profileHtml(config, url.searchParams.get("theme") === "dark")); return;
  }
  const route = routes.get(url.pathname);
  if (!route) {
    res.writeHead(404);
    res.end();
    return;
  }
  try {
    const body = await readFile(new URL(route[0], root));
    res.writeHead(200, {
      "Content-Type": route[1],
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(500);
    res.end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
let browser;
try {
  browser = await chromium.launch({
    headless: process.env.GALLERY_HEADED !== "1",
    args: [
      "--disable-features=AutofillAiWalletPrivatePasses,AutofillAmbientAutofill",
    ],
  });
  if (process.env.GALLERY_REUSE_CAPTURE !== "1")
    await capture(browser, config, `http://127.0.0.1:${port}`);
  const context = await browser.newContext({ deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const layoutAnchors = new Map();
  const all = process.env.GALLERY_RENDER_ALL === "1";
  for (const variant of all ? variants : [config.variant])
    for (const style of all ? stylesFor(variant) : [config.style])
      for (const theme of ["light", "dark"])
        for (const mobile of [false, true]) {
          const size = mobile
            ? { width: 900, height: 900 }
            : { width: 1600, height: 700 };
          await page.setViewportSize(size);
          await page.goto(
            `http://127.0.0.1:${port}/?variant=${variant}&style=${style}&theme=${theme}&mobile=${mobile}&sectionLabels=${config.showSectionLabels === true}`,
            { waitUntil: "networkidle" },
          );
          await page.waitForFunction(
            () => window.galleryReady,
            {},
            { timeout: 60000 },
          );
          const ready = await page.evaluate(() => window.galleryReady);
          const labelsFit = ready.labelsFit;
          if (!ready.decorFits)
            throw new Error(
              `Clipped decoration: ${variant}/${style}/${mobile}`,
            );
          if (
            !config.showSectionLabels &&
            JSON.stringify(ready.labelTexts) !== JSON.stringify([config.label])
          )
            throw new Error(
              `Unexpected visible nameplate: ${variant}/${style}`,
            );
          const layoutKey = `${variant}/${theme}/${mobile}`;
          const anchors = JSON.stringify(ready.anchors);
          if (style === "simple") layoutAnchors.set(layoutKey, anchors);
          else if (
            variant !== "pavilion" && layoutAnchors.has(layoutKey) &&
            layoutAnchors.get(layoutKey) !== anchors
          )
            throw new Error(`Finish changed exhibit placement: ${layoutKey}`);
          if (!labelsFit)
            throw new Error(`Clipped labels in ${variant}/${theme}/${mobile}`);
          if (errors.length)
            throw new Error(`Scene failed: ${errors.join("; ")}`);
          const filename = `${assetName(variant, style)}${mobile ? "-mobile" : ""}-${theme}.png`;
          await page.screenshot({
            path: `assets/gallery/${filename}`,
            animations: "disabled",
          });
          console.log(`Rendered ${filename}`);
        }
  // Verify that optional section nameplates remain available without publishing them.
  await page.goto(
    `http://127.0.0.1:${port}/?variant=wall&style=simple&theme=light&mobile=false&sectionLabels=true`,
  );
  await page.waitForFunction(() => window.galleryReady);
  const restoredLabels = await page.evaluate(
    () => window.galleryReady.labelTexts,
  );
  if (restoredLabels.length !== 3 || !restoredLabels.includes(config.language === "ko" ? "활동 기록" : "Contributions"))
    throw new Error("Optional section nameplates could not be restored");
  // Optional review evidence remains outside the product repository.
  if (process.env.GALLERY_EVIDENCE_DIR) {
    await mkdir(process.env.GALLERY_EVIDENCE_DIR, { recursive: true });
    const { join } = await import("node:path");
    for (const variant of all ? variants : [config.variant])
      for (const style of all ? stylesFor(variant) : [config.style])
        await copyFile(
          `assets/gallery/${assetName(variant, style)}-light.png`,
          join(
            process.env.GALLERY_EVIDENCE_DIR,
            `${assetName(variant, style)}-light.png`,
          ),
        );
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
