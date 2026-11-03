#!/usr/bin/env node

import assert from "node:assert/strict";
import { test } from "node:test";
import { checkCommand, checkFileEdit, segments } from "./guard.mjs";

const verdict = (cmd, branch = "dev") => checkCommand(cmd, branch)?.[0] ?? "allow";

test("force pushes to protected branches are denied", () => {
  assert.equal(verdict("git push --force origin main"), "deny");
  assert.equal(verdict("git push -f origin preview"), "deny");
  assert.equal(verdict("git push --force-with-lease origin dev"), "deny");
  assert.equal(verdict("git push origin +main"), "deny");
  assert.equal(verdict("git push -uf origin dev"), "deny");
  assert.equal(verdict("git push --force", "preview"), "deny");
  assert.equal(verdict("git -C ../site push --force origin main"), "deny");
  assert.equal(verdict("npm test && git push -f origin dev"), "deny");
});

test("direct pushes to main are denied, dev and preview are allowed", () => {
  assert.equal(verdict("git push origin main"), "deny");
  assert.equal(verdict("git push origin HEAD:main", "dev"), "deny");
  assert.equal(verdict("git push origin dev:refs/heads/main"), "deny");
  assert.equal(verdict("git push", "main"), "deny");
  assert.equal(verdict("git push origin dev"), "allow");
  assert.equal(verdict("git push -u origin preview"), "allow");
  assert.equal(verdict("git push origin chore/claude-setup"), "allow");
});

test("deleting protected branches is denied", () => {
  assert.equal(verdict("git push origin --delete preview"), "deny");
  assert.equal(verdict("git push origin :dev"), "deny");
  assert.equal(verdict("git branch -D main"), "deny");
  assert.equal(verdict("git branch -d feature/x"), "allow");
});

test("force push to a feature branch asks", () => {
  assert.equal(verdict("git push --force-with-lease origin feature/hero"), "ask");
});

test("commits and merges on main are denied", () => {
  assert.equal(verdict('git commit -m "x"', "main"), "deny");
  assert.equal(verdict("git merge dev", "main"), "deny");
  assert.equal(verdict('git commit -m "x"', "dev"), "allow");
  assert.equal(verdict("git pull --ff-only", "main"), "allow");
});

test("destructive local commands ask first", () => {
  assert.equal(verdict("git reset --hard HEAD~1"), "ask");
  assert.equal(verdict("git clean -fd"), "ask");
  assert.equal(verdict("git checkout ."), "ask");
  assert.equal(verdict("gh pr merge 12 --merge"), "ask");
});

test("production CLI deploys are denied", () => {
  assert.equal(verdict("npx vercel --prod"), "deny");
  assert.equal(verdict("npx vercel"), "allow");
  assert.equal(verdict("vercel deploy --prod"), "deny");
});

test("quoted text that mentions git push is not treated as a command", () => {
  assert.equal(verdict('git commit -m "docs: never git push --force origin main"'), "allow");
  assert.equal(segments('echo "a && b"').length, 1);
});

test("secret and generated files cannot be edited", () => {
  assert.equal(checkFileEdit(".env")?.[0], "deny");
  assert.equal(checkFileEdit("C:\\Users\\me\\site\\.env.production")?.[0], "deny");
  assert.equal(checkFileEdit("/repo/package-lock.json")?.[0], "deny");
  assert.equal(checkFileEdit("/repo/src/env.d.ts"), null);
  assert.equal(checkFileEdit("/repo/src/pages/api/apply.ts"), null);
});
