import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { join, resolve, relative, isAbsolute } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolveConfig } from "./config.mjs";
import { updateReadme, galleryBlock, start, end } from "./readme.mjs";
import { isPublicAddress, profileHtml } from "./capture.mjs";
const raw = JSON.parse(await readFile(new URL("../../config/gallery.json", import.meta.url), "utf8"));
test("template binds to the new repository, never to the original owner's data", () => {
  const config = resolveConfig(raw, { GITHUB_REPOSITORY: "someone/someone" });
  assert.equal(config.owner, "someone"); assert.equal(config.link, "https://github.com/someone");
  assert.match(galleryBlock(config), /someone\/someone\/issues\/new/);
  assert.match(profileHtml(config, false), /github.com\/someone/);
  assert.equal(resolveConfig({ ...raw, variant: "pavilion" }, {}).style, "advanced");
});
test("rejects unsafe site URLs, repository paths and invalid settings", () => {
  for (const url of ["http://example.com", "file:///tmp/a", "https://user:pass@example.com", "https://127.0.0.1", "https://localhost", "https://example.com:3000", "https://[::1]"])
    assert.throws(() => resolveConfig({ ...raw, portfolioUrl: url }, {}));
  for (const repository of ["../secret", "owner/repo/x", "owner/repo\n", "owner/repo;cmd"]) assert.throws(() => resolveConfig(raw, { GITHUB_REPOSITORY: repository }));
  assert.throws(() => resolveConfig({ ...raw, maxVisitors: 10 }, {}));
  assert.throws(() => resolveConfig({ ...raw, capture: { readySelector: 2 } }, {}));
  assert.throws(() => resolveConfig({ ...raw, language: "unknown" }, {}));
});
test("README updates preserve user text and reject ambiguous markers", () => {
  const original = `# My work\r\n\n${start}\nold\n${end}\n\nContact me.\r\n`;
  assert.equal(updateReadme(original, "NEW"), "# My work\r\n\nNEW\n\nContact me.\r\n");
  assert.equal(updateReadme("# Hello", "BLOCK"), "# Hello\n\nBLOCK\n");
  for (const text of [start, end, end + start, start + start + end]) assert.throws(() => updateReadme(text, "NEW"));
  const config = resolveConfig({ ...raw, portfolioUrl: 'https://example.com/?x="&q=<hello>' }, {});
  assert.ok(!galleryBlock(config).includes('href="https://example.com/?x="'));
});
test("capture filters private addresses", () => {
  for (const ip of ["127.0.0.1", "10.0.0.1", "172.16.1.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "::1", "fe80::1", "::ffff:127.0.0.1"]) assert.equal(isPublicAddress(ip), false, ip);
  assert.equal(isPublicAddress("8.8.8.8"), true);
  assert.equal(isPublicAddress("2606:4700::1111"), true);
});
test("first template run removes only the untouched guide; edited introductions survive", async () => {
  const directory = await mkdtemp(join(process.env.GALLERY_TEST_TMP || tmpdir(), "readme-gallery-"));
  try {
    await mkdir(join(directory, "config")); await mkdir(join(directory, "docs"));
    const guide = await readFile(new URL("../../docs/template-guide.md", import.meta.url), "utf8");
    await writeFile(join(directory, "docs/template-guide.md"), guide);
    await writeFile(join(directory, "config/gallery.json"), JSON.stringify(raw));
    const template = `${start}\nold preview\n${end}\n\n${guide}`;
    const run = () => execFileSync(process.execPath, [fileURLToPath(new URL("./readme.mjs", import.meta.url))], {
      cwd: directory, env: { ...process.env, GITHUB_REPOSITORY: "new-user/new-user" }, encoding: "utf8",
    });
    await writeFile(join(directory, "README.md"), template); run();
    const result = await readFile(join(directory, "README.md"), "utf8");
    assert.ok(!result.includes(guide)); assert.match(result, /new-user\/new-user\/issues/); assert.match(result, /by <a href="https:\/\/github.com\/okorion">okorion/);
    await writeFile(join(directory, "README.md"), "# My biography\n\n" + template + "\nMy contact"); run();
    const edited = await readFile(join(directory, "README.md"), "utf8");
    assert.ok(edited.startsWith("# My biography")); assert.ok(edited.endsWith("My contact")); assert.ok(edited.includes(guide));
    run(); assert.equal(await readFile(join(directory, "README.md"), "utf8"), edited);
  } finally {
    const parent = resolve(process.env.GALLERY_TEST_TMP || tmpdir());
    const child = relative(parent, resolve(directory));
    if (!child || child.startsWith("..") || isAbsolute(child)) throw new Error("Unsafe temporary cleanup path");
    await rm(directory, { recursive: true, force: true });
  }
});
