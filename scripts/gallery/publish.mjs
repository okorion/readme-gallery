import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { loadConfig } from "./config.mjs";
const config = await loadConfig();
const branch = process.env.GITHUB_REF_NAME || execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
if (!branch || branch.startsWith("refs/") || /[\s~^:?*\[\\]/.test(branch)) throw new Error("Invalid target branch");
// Git data API keeps credentials out of the rendering browser and shell arguments.
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error("Missing publish token");
const base = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
const changed = execFileSync(
  "git",
  ["ls-files", "-m", "-o", "--exclude-standard"],
  { encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter(Boolean);
if (!changed.length) {
  console.log("Gallery is current");
  process.exit(0);
}
const allowed =
  /^(?:README\.md|config\/gallery\.json|assets\/gallery\/(?:data\.json|source\.json|portfolio(?:-dark)?\.png|(?:wall|gallery|island|pavilion)(?:-advanced)?(?:-mobile)?-(?:light|dark)\.png))$/;
if (changed.some((p) => !allowed.test(p)))
  throw new Error("Unexpected modified file; publish stopped");
async function api(path, method = "GET", body) {
  const r = await fetch(
    `https://api.github.com/repos/${config.repository}/${path}`,
    {
      method,
      redirect: "error",
      signal: AbortSignal.timeout(30000),
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    },
  );
  if (!r.ok) throw new Error(`Publish API failed (${r.status})`);
  return r.json();
}
if ((await api(`git/ref/heads/${branch}`)).object.sha !== base)
  throw new Error(
    "Branch changed during render; rerun to preserve concurrent changes",
  );
const parent = await api(`git/commits/${base}`);
const tree = [];
for (const path of changed) {
  const bytes = await readFile(path);
  const blob = await api("git/blobs", "POST", {
    content: bytes.toString("base64"),
    encoding: "base64",
  });
  tree.push({ path, mode: "100644", type: "blob", sha: blob.sha });
}
const createdTree = await api("git/trees", "POST", {
  base_tree: parent.tree.sha,
  tree,
});
const commit = await api("git/commits", "POST", {
  message: "[chore] Refresh README gallery",
  tree: createdTree.sha,
  parents: [base],
});
await api(`git/refs/heads/${branch}`, "PATCH", { sha: commit.sha, force: false });
console.log(`Published gallery commit ${commit.sha}`);
