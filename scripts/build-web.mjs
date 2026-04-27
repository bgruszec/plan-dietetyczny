import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const outDir = resolve(root, "www");

const entriesToCopy = [
  "index.html",
  "style.css",
  "script.js",
  "recipes.json",
  "plans",
  "api"
];

loadDotEnv();
prepareOutDir();
copyWebEntries();
writeRuntimeConfig();

function prepareOutDir() {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
}

function copyWebEntries() {
  for (const entry of entriesToCopy) {
    const src = resolve(root, entry);
    const dest = resolve(outDir, entry);
    if (!existsSync(src)) continue;
    if (isDirectory(src)) {
      cpSync(src, dest, { recursive: true });
    } else {
      copyFileSync(src, dest);
    }
  }
}

function writeRuntimeConfig() {
  const payload = {
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ""
  };
  writeFileSync(resolve(outDir, "runtime-config.json"), JSON.stringify(payload, null, 2));
}

function loadDotEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function isDirectory(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}
