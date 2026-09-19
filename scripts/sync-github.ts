// ══════════════════════════════════════════════════════════════════
// npm run sync:github
//
// Descarga el archivo de GitHub y lo guarda en
// src/data/github-snapshot.json. El sitio lo usa cuando no hay
// GITHUB_TOKEN o cuando la API falla, así que la web nunca depende de
// que GitHub responda en el momento de la visita.
//
// Token: GITHUB_TOKEN, o si no existe, el de `gh auth token`.
// Corre con Node >= 23 (tipos de TypeScript eliminados de forma nativa).
// ══════════════════════════════════════════════════════════════════

import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchGitHubArchive } from "../src/lib/github/fetch-archive.ts";
import { GITHUB_USER } from "../src/lib/github/config.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "src/data/github-snapshot.json");

function resolveToken(): string | undefined {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync("gh auth token", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return undefined;
  }
}

const token = resolveToken();
if (!token) {
  console.warn("Sin token: la API anónima probablemente se quede sin cuota a mitad.");
}

const started = Date.now();
const archive = await fetchGitHubArchive({ user: GITHUB_USER, token, statsRetries: 4 });
const snapshot = { ...archive, source: "snapshot" as const };

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(snapshot, null, 1) + "\n");

const withStats = archive.repos.filter((r) => r.weeklyCommits).length;
console.log(
  `✓ ${archive.repos.length} repos → src/data/github-snapshot.json ` +
    `(${withStats} con actividad semanal, ${((Date.now() - started) / 1000).toFixed(1)} s)`,
);
