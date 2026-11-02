#!/usr/bin/env node

import { spawnSync, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const WATCHED = /\.(astro|tsx?|jsx?|mjs|cjs|css|json|mdx?)$/i;
const IGNORED = /^(\.claude\/|\.github\/|notes\/|dist\/|\.astro\/|\.vercel\/)/;

const CHECKS = [
  { name: "astro check", cmd: "npm run --silent check" },
  { name: "unit tests", cmd: "npm test --silent" },
];

function git(args, cwd) {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

function changedSourceFiles(cwd) {
  const lines = git(["status", "--porcelain", "--untracked-files=all"], cwd).split("\n");
  return lines
    .map((l) => l.slice(3).trim().replace(/^"|"$/g, ""))
    .map((p) => (p.includes(" -> ") ? p.split(" -> ")[1] : p))
    .filter((p) => p && WATCHED.test(p) && !IGNORED.test(p));
}

function fingerprint(cwd, files) {
  const h = createHash("sha1");
  h.update(git(["diff", "HEAD"], cwd));
  for (const f of files) {
    try {
      h.update(f + statSync(join(cwd, f)).mtimeMs);
    } catch {
      h.update(f + ":gone");
    }
  }
  return h.digest("hex");
}

function tail(text, n) {
  return text.trim().split("\n").slice(-n).join("\n");
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  let input = {};
  try {
    input = JSON.parse(raw || "{}");
  } catch {}

  if (input.stop_hook_active) process.exit(0);

  const cwd = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  if (!existsSync(join(cwd, "node_modules"))) process.exit(0);
  if (!existsSync(join(cwd, "node_modules", "@astrojs", "check"))) {
    process.stderr.write("verify hook skipped: run `npm install` so @astrojs/check is available.\n");
    process.exit(0);
  }

  const files = changedSourceFiles(cwd);
  if (files.length === 0) process.exit(0);

  const stateDir = join(cwd, ".claude", ".cache");
  const stateFile = join(stateDir, "verify-pass.txt");
  const fp = fingerprint(cwd, files);
  if (existsSync(stateFile) && readFileSync(stateFile, "utf8").trim() === fp) process.exit(0);

  const failures = [];
  for (const check of CHECKS) {
    const r = spawnSync(check.cmd, { cwd, shell: true, encoding: "utf8", env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1", FORCE_COLOR: "0", NO_COLOR: "1" } });
    if (r.status !== 0) {
      failures.push(`--- ${check.name} failed (exit ${r.status}) ---\n${tail(`${r.stdout || ""}\n${r.stderr || ""}`, 40)}`);
    }
  }

  if (failures.length) {
    process.stderr.write(
      `Verification failed for changed files (${files.slice(0, 8).join(", ")}${files.length > 8 ? ", ..." : ""}).\n` +
        "Fix these before finishing, then summarise what you changed:\n\n" +
        failures.join("\n\n") +
        "\n",
    );
    process.exit(2);
  }

  mkdirSync(stateDir, { recursive: true });
  writeFileSync(stateFile, fp);
  process.exit(0);
}

main();
