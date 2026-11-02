#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { basename } from "node:path";
import { pathToFileURL } from "node:url";

const PRODUCTION = "main";
const PROTECTED = new Set(["main", "preview", "dev"]);
const SECRET_FILE = /(^|[\\/])\.env(\..*)?$/i;
const GENERATED_FILES = new Set(["package-lock.json"]);

function decide(decision, reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: decision,
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

function currentBranch(cwd) {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

export function tokenize(command) {
  const tokens = [];
  let cur = "";
  let quote = null;
  let hasToken = false;
  const push = () => {
    if (hasToken) tokens.push(cur);
    cur = "";
    hasToken = false;
  };
  for (let i = 0; i < command.length; i++) {
    const ch = command[i];
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      hasToken = true;
      continue;
    }
    if (/\s/.test(ch)) {
      if (ch === "\n") {
        push();
        tokens.push(";");
      } else push();
      continue;
    }
    const two = command.slice(i, i + 2);
    if (two === "&&" || two === "||") {
      push();
      tokens.push(two);
      i++;
      continue;
    }
    if (ch === ";" || ch === "|" || ch === "&") {
      push();
      tokens.push(ch);
      continue;
    }
    cur += ch;
    hasToken = true;
  }
  push();
  return tokens;
}

export function segments(command) {
  const out = [];
  let seg = [];
  for (const t of tokenize(command)) {
    if ([";", "&&", "||", "|", "&"].includes(t)) {
      if (seg.length) out.push(seg);
      seg = [];
    } else seg.push(t);
  }
  if (seg.length) out.push(seg);
  return out;
}

function parseGit(seg) {
  const i = seg.findIndex((t) => basename(t).replace(/\.exe$/i, "") === "git");
  if (i === -1) return null;
  let j = i + 1;
  while (j < seg.length && seg[j].startsWith("-")) {
    if (["-C", "-c", "--git-dir", "--work-tree", "--namespace"].includes(seg[j])) j += 2;
    else j += 1;
  }
  if (j >= seg.length) return null;
  return { sub: seg[j], args: seg.slice(j + 1) };
}

const FORCE_FLAGS = /^(-f|--force|--force-with-lease(=.*)?|--force-if-includes|--mirror)$/;

export function checkGitPush(args, branchNow) {
  const flags = args.filter((a) => a.startsWith("-"));
  const positional = args.filter((a) => !a.startsWith("-"));
  const force = flags.some((f) => FORCE_FLAGS.test(f) || /^-[a-zA-Z]*f[a-zA-Z]*$/.test(f));
  const deleting = flags.some((f) => f === "--delete" || f === "-d");
  const refspecs = positional.slice(1);
  const targets = [];
  let plusForce = false;
  if (refspecs.length === 0) {
    if (flags.includes("--all") || flags.includes("--mirror")) targets.push(...PROTECTED);
    else if (branchNow) targets.push(branchNow);
  }
  for (let spec of refspecs) {
    if (spec.startsWith("+")) {
      plusForce = true;
      spec = spec.slice(1);
    }
    const parts = spec.split(":");
    let dest = parts.length > 1 ? parts[1] : parts[0];
    if (parts.length > 1 && parts[0] === "") {
      targets.push({ deleted: dest.replace(/^refs\/heads\//, "") });
      continue;
    }
    if (dest === "HEAD") dest = branchNow;
    targets.push(dest.replace(/^refs\/heads\//, ""));
  }

  for (const t of targets) {
    const name = typeof t === "string" ? t : t.deleted;
    const isDelete = typeof t !== "string" || deleting;
    if (PROTECTED.has(name) && isDelete) {
      return ["deny", `Deleting the protected branch '${name}' is not allowed.`];
    }
    if (PROTECTED.has(name) && (force || plusForce)) {
      return [
        "deny",
        `Force-pushing to '${name}' is blocked. Protected branches (main, preview, dev) only move forward. ` +
          "Fix history with a new commit (git revert) instead of rewriting it.",
      ];
    }
    if (name === PRODUCTION) {
      return [
        "deny",
        "Direct pushes to main are blocked: main is the Vercel production branch. " +
          "Push to dev or preview, then open a pull request preview -> main (see the ship skill).",
      ];
    }
  }
  if (force || plusForce) {
    return ["ask", "Force push to a non-protected branch. Confirm this rewrite of remote history is intended."];
  }
  return null;
}

export function checkCommand(command, branchNow) {
  for (const seg of segments(command)) {
    const head = basename(seg[0] || "").replace(/\.(exe|cmd)$/i, "");

    const runsVercel = seg.some((t) => basename(t).replace(/\.(exe|cmd)$/i, "") === "vercel");
    if (runsVercel && seg.some((t) => t === "--prod" || t === "--production")) {
      return ["deny", "Production deploys happen only by merging into main through a pull request, never from the CLI."];
    }
    if (head === "gh" && seg[1] === "pr" && seg[2] === "merge") {
      return ["ask", "Merging a pull request can ship to production. Confirm the PR, its target branch and that checks passed."];
    }

    const git = parseGit(seg);
    if (!git) continue;
    const { sub, args } = git;

    if (sub === "push") {
      const r = checkGitPush(args, branchNow);
      if (r) return r;
    }

    if (["commit", "merge", "rebase", "cherry-pick", "revert", "am"].includes(sub) && branchNow === PRODUCTION) {
      return [
        "deny",
        `'git ${sub}' on main is blocked. main only changes through a reviewed pull request from preview. ` +
          "Switch to dev or a feature branch first (git switch dev).",
      ];
    }

    if (sub === "branch" && args.some((a) => ["-D", "-d", "--delete"].includes(a))) {
      const named = args.filter((a) => !a.startsWith("-"));
      const hit = named.find((n) => PROTECTED.has(n));
      if (hit) return ["deny", `Deleting the protected branch '${hit}' is not allowed.`];
    }

    if (sub === "reset" && args.includes("--hard")) {
      return ["ask", "git reset --hard discards uncommitted work. Contribution rule: create, not destroy. Confirm first."];
    }
    if (sub === "clean" && args.some((a) => /^-[a-zA-Z]*f/.test(a) || a === "--force")) {
      return ["ask", "git clean -f permanently deletes untracked files. Confirm first."];
    }
    if ((sub === "checkout" || sub === "restore") && args.includes(".")) {
      return ["ask", `git ${sub} . discards local changes across the tree. Confirm first.`];
    }
  }
  return null;
}

export function checkFileEdit(filePath) {
  if (!filePath) return null;
  const normalized = filePath.replace(/\\/g, "/");
  if (SECRET_FILE.test(normalized)) {
    return ["deny", "Editing .env files is blocked. Ask the user to change secrets themselves (and in the Vercel dashboard)."];
  }
  if (GENERATED_FILES.has(basename(normalized))) {
    return ["deny", "package-lock.json is generated. Change dependencies with npm install/uninstall instead of editing it."];
  }
  return null;
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  let input;
  try {
    input = JSON.parse(raw || "{}");
  } catch {
    process.exit(0);
  }
  const tool = input.tool_name || "";
  const ti = input.tool_input || {};
  const cwd = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();

  let result = null;
  if (tool === "Bash" || tool === "PowerShell") {
    result = checkCommand(String(ti.command || ""), currentBranch(cwd));
  } else if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) {
    result = checkFileEdit(ti.file_path || ti.notebook_path || "");
  }
  if (result) decide(result[0], result[1]);
  process.exit(0);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main();
}
