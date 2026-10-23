import { mkdir, writeFile } from "node:fs/promises";
// Offline example data is explicitly marked, never presented as live activity.
const weeks = Array.from({ length: 26 }, (_, w) => Array.from({ length: 7 }, (_, d) => ({
  date: new Date(Date.UTC(2026, 0, 4 + w * 7 + d)).toISOString().slice(0, 10), count: (w * 3 + d * 5) % 13,
})));
const artworks = ["sphere", "cube", "torus", "arch", "pyramid"].map((shape, i) => ({
  shape, color: ["blue", "mint", "violet", "white"][i % 4], issue: i + 1, authorId: i + 1, createdAt: "2026-01-01T00:00:00Z",
}));
await mkdir("assets/gallery", { recursive: true });
await writeFile("assets/gallery/data.json", JSON.stringify({ version: 1, demo: true, weeks, artworks }, null, 2) + "\n");
console.log("Offline demo data written. Run gallery:collect before publishing real activity.");
