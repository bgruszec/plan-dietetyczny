import express from "express";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { runChatDiet } from "./api/run-chat-diet.js";

loadDotEnv();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "1mb" }));
app.use(express.static(process.cwd()));

app.get("/api/runtime-config", (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ""
  });
});

app.post("/api/chat-diet", (req, res) => runChatDiet(req, res));

app.get("*", (req, res) => {
  const indexPath = resolve(process.cwd(), "index.html");
  if (existsSync(indexPath)) {
    res.type("html").send(readFileSync(indexPath, "utf8"));
    return;
  }
  res.status(404).send("Brak index.html");
});

app.listen(port, () => {
  console.log(`Server started: http://localhost:${port}`);
});

function loadDotEnv() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
}
