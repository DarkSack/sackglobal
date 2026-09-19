// ══════════════════════════════════════════════════════════════════
// Catálogo de tecnologías y detección
//
// Una tecnología solo aparece en el sitio si algún repo la delata: una
// dependencia en un manifiesto, un topic o un lenguaje con peso real.
// Cada detección guarda su evidencia, que es lo que se enseña al pasar
// por encima en el Technology Map.
//
// Si falta algo en el catálogo, simplemente no se detecta: preferible
// a detectar de más.
// ══════════════════════════════════════════════════════════════════

import type { ManifestRecord, RepoRecord } from "@/lib/github/types";
import type { DetectedTech, Evidence, TechGroup } from "./types";

interface TechDef {
  id: string;
  name: string;
  group: TechGroup;
  npm?: (string | RegExp)[];
  gradle?: (string | RegExp)[];
  nuget?: (string | RegExp)[];
  topics?: string[];
  languages?: string[];
  manifest?: ManifestRecord["kind"][];
  /** Condición a medida cuando lo anterior no basta. */
  custom?: (repo: RepoRecord) => string | null;
}

export const TECH_CATALOG: TechDef[] = [
  // Lenguajes: solo con al menos un 8 % del código (ver `languageShare`).
  { id: "typescript", name: "TypeScript", group: "language", languages: ["TypeScript"] },
  { id: "javascript", name: "JavaScript", group: "language", languages: ["JavaScript"] },
  { id: "java", name: "Java", group: "language", languages: ["Java"] },
  { id: "kotlin", name: "Kotlin", group: "language", languages: ["Kotlin"] },
  { id: "csharp", name: "C#", group: "language", languages: ["C#"] },
  { id: "sql", name: "SQL (PL/pgSQL)", group: "language", languages: ["PLpgSQL"] },

  // Frontend
  { id: "react", name: "React", group: "frontend", npm: ["react-dom", "react"] },
  { id: "nextjs", name: "Next.js", group: "frontend", npm: ["next"] },
  { id: "vite", name: "Vite", group: "frontend", npm: ["vite", "@vitejs/plugin-react", "@tailwindcss/vite"] },
  { id: "tailwind", name: "Tailwind CSS", group: "frontend", npm: ["tailwindcss", /^@tailwindcss\//] },
  { id: "shadcn", name: "shadcn/ui", group: "frontend", npm: ["shadcn"], topics: ["shadcn-ui"] },
  { id: "radix", name: "Radix UI", group: "frontend", npm: ["radix-ui", /^@radix-ui\//], topics: ["radix-ui"] },
  { id: "pixijs", name: "PixiJS", group: "frontend", npm: ["pixi.js", "@pixi/react"] },
  { id: "next-intl", name: "next-intl", group: "frontend", npm: ["next-intl"] },
  { id: "zustand", name: "Zustand", group: "frontend", npm: ["zustand"] },
  { id: "zod", name: "Zod", group: "frontend", npm: ["zod"] },
  {
    id: "chrome-ext",
    name: "Chrome Extensions (MV3)",
    group: "frontend",
    manifest: ["chrome-manifest"],
  },

  // Backend y datos
  {
    id: "nodejs",
    name: "Node.js",
    group: "backend",
    npm: ["express", "node-cron", "node-telegram-bot-api", "inquirer", "cors", "graphql-yoga", "rate-limiter-flexible"],
    topics: ["nodejs"],
  },
  { id: "express", name: "Express", group: "backend", npm: ["express"] },
  { id: "graphql", name: "GraphQL", group: "backend", npm: ["graphql", "graphql-yoga", "@apollo/client", "urql"], topics: ["graphql"] },
  { id: "jwt", name: "JWT", group: "backend", npm: ["jsonwebtoken", "jose"], topics: ["jwt"] },
  { id: "websocket", name: "WebSocket", group: "backend", npm: ["ws", "socket.io"], topics: ["websocket"] },
  { id: "supabase", name: "Supabase", group: "data", npm: [/^@supabase\//], topics: ["supabase"] },
  { id: "postgres", name: "PostgreSQL", group: "data", languages: ["PLpgSQL"], topics: ["postgresql"] },
  {
    id: "sqlite",
    name: "SQLite",
    group: "data",
    npm: ["sqlite3", "better-sqlite3", "expo-sqlite"],
    gradle: ["org.xerial:sqlite-jdbc"],
    nuget: ["Microsoft.Data.Sqlite"],
    topics: ["sqlite"],
  },
  { id: "libsql", name: "libSQL / Turso", group: "data", npm: ["@libsql/client"] },
  { id: "indexeddb", name: "IndexedDB", group: "data", npm: ["idb"], topics: ["indexeddb"] },
  { id: "insforge", name: "InsForge", group: "data", npm: ["@insforge/sdk"] },

  // Mobile
  { id: "react-native", name: "React Native", group: "mobile", npm: ["react-native"] },
  { id: "expo", name: "Expo", group: "mobile", npm: ["expo"], manifest: ["expo-app.json"] },
  { id: "compose", name: "Jetpack Compose", group: "mobile", gradle: [/^androidx\.compose/], topics: ["jetpack-compose"] },
  { id: "android", name: "Android SDK", group: "mobile", gradle: ["com.android.application"], topics: ["android"] },

  // IA
  { id: "groq", name: "Groq", group: "ai", npm: ["groq-sdk"], topics: ["groq"] },
  { id: "replicate", name: "Replicate", group: "ai", npm: ["replicate"], topics: ["replicate"] },

  // Automatización
  { id: "playwright", name: "Playwright", group: "tooling", npm: ["playwright"] },
  { id: "telegram", name: "Telegram Bot API", group: "backend", npm: ["node-telegram-bot-api"], topics: ["telegram-bot"] },

  // Minecraft
  {
    id: "paper",
    name: "Paper API",
    group: "minecraft",
    gradle: [/^io\.papermc/],
    topics: ["paper-plugin"],
  },
  { id: "bukkit", name: "Bukkit / Spigot", group: "minecraft", topics: ["bukkit", "spigot"] },
  { id: "vault", name: "Vault", group: "minecraft", gradle: ["com.github.MilkBowl:VaultAPI"] },
  { id: "papi", name: "PlaceholderAPI", group: "minecraft", gradle: ["me.clip:placeholderapi"] },
  { id: "protocollib", name: "ProtocolLib", group: "minecraft", gradle: [/protocollib/i] },

  // Sistemas
  {
    id: "dotnet",
    name: ".NET",
    group: "systems",
    manifest: ["csproj"],
    custom: (repo) => {
      const tf = repo.manifests.find((m) => m.kind === "csproj" && m.targetFramework);
      return tf && tf.kind === "csproj" ? `${tf.path} (${tf.targetFramework})` : null;
    },
  },
  {
    id: "winforms",
    name: "Windows Forms",
    group: "systems",
    custom: (repo) =>
      repo.manifests.find((m) => m.kind === "csproj" && m.windowsForms)?.path ?? null,
  },
  { id: "ed25519", name: "Ed25519", group: "systems", npm: ["@noble/ed25519"], nuget: ["NSec.Cryptography"], topics: ["ed25519"] },

  // Tooling
  { id: "gradle", name: "Gradle", group: "tooling", manifest: ["gradle"], topics: ["gradle"] },
  { id: "vitest", name: "Vitest", group: "tooling", npm: ["vitest"] },
  { id: "junit", name: "JUnit / Mockito", group: "tooling", gradle: [/^org\.mockito/, "junit:junit"] },
  { id: "docker", name: "Docker", group: "tooling", manifest: ["docker"] },
  {
    id: "npm-publish",
    name: "npm (paquetes publicados)",
    group: "tooling",
    custom: (repo) =>
      repo.manifests.some((m) => m.kind === "package.json" && m.hasBin) &&
      repo.topics.includes("npm-package")
        ? "package.json#bin + topic:npm-package"
        : null,
  },
  {
    id: "vercel",
    name: "Vercel",
    group: "tooling",
    topics: ["vercel"],
    custom: (repo) =>
      repo.homepage?.includes(".vercel.app") ? `homepage ${new URL(repo.homepage).host}` : null,
  },
];

const MIN_LANGUAGE_SHARE = 0.08;

export function languageShare(repo: RepoRecord): { name: string; share: number }[] {
  const total = Object.values(repo.languages).reduce((a, b) => a + b, 0);
  if (!total) return [];
  return Object.entries(repo.languages)
    .map(([name, bytes]) => ({ name, share: bytes / total }))
    .sort((a, b) => b.share - a.share);
}

function matches(value: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some((p) => (typeof p === "string" ? p === value : p.test(value)));
}

export function detectTech(repo: RepoRecord, exclude: string[] = []): DetectedTech[] {
  const langs = languageShare(repo);
  const found: DetectedTech[] = [];

  for (const def of TECH_CATALOG) {
    if (exclude.includes(def.name)) continue;
    const evidence: Evidence[] = [];

    for (const m of repo.manifests) {
      if (def.manifest?.includes(m.kind)) evidence.push({ kind: "manifest", where: m.path });
      if (m.kind === "package.json" && def.npm) {
        const hit = [...m.dependencies, ...m.devDependencies].find((d) => matches(d, def.npm!));
        if (hit) evidence.push({ kind: "dependency", where: `${m.path} → ${hit}` });
      }
      if (m.kind === "gradle" && def.gradle) {
        const hit = [...m.coordinates, ...m.plugins].find((d) => matches(d, def.gradle!));
        if (hit) evidence.push({ kind: "dependency", where: `${m.path} → ${hit}` });
      }
      if (m.kind === "csproj" && def.nuget) {
        const hit = m.packages.find((d) => matches(d, def.nuget!));
        if (hit) evidence.push({ kind: "dependency", where: `${m.path} → ${hit}` });
      }
    }
    for (const t of def.topics ?? []) {
      if (repo.topics.includes(t)) evidence.push({ kind: "topic", where: `topic:${t}` });
    }
    for (const l of def.languages ?? []) {
      const share = langs.find((x) => x.name === l)?.share ?? 0;
      if (share >= MIN_LANGUAGE_SHARE) {
        evidence.push({ kind: "language", where: `${l} ${Math.round(share * 100)} %` });
      }
    }
    const custom = def.custom?.(repo);
    if (custom) evidence.push({ kind: "manifest", where: custom });

    if (evidence.length) {
      // Un mismo fichero puede aparecer dos veces (manifest + dependency).
      const seen = new Set<string>();
      found.push({
        id: def.id,
        name: def.name,
        group: def.group,
        evidence: evidence.filter((e) => !seen.has(e.where) && seen.add(e.where)),
      });
    }
  }
  // Los lenguajes, por peso real en el repo: el primero es el principal.
  const share = (t: DetectedTech) => langs.find((l) => l.name === TECH_CATALOG.find((d) => d.id === t.id)?.languages?.[0])?.share ?? 0;
  const languages = found.filter((t) => t.group === "language").sort((a, b) => share(b) - share(a));
  return [...languages, ...found.filter((t) => t.group !== "language")];
}

export const TECH_GROUP_LABEL: Record<TechGroup, string> = {
  language: "Languages",
  frontend: "Frontend",
  backend: "Backend",
  data: "Data",
  mobile: "Mobile",
  ai: "AI",
  minecraft: "Minecraft",
  systems: "Systems",
  tooling: "Tooling",
};

export const TECH_GROUP_ORDER: TechGroup[] = [
  "language",
  "frontend",
  "backend",
  "data",
  "mobile",
  "minecraft",
  "systems",
  "ai",
  "tooling",
];
