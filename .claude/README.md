# How Claude Code is set up in this repo

Everything in `.claude/`, plus `CLAUDE.md`, `AGENTS.md` and `.mcp.json`, is shared through git so every contributor's Claude behaves the same way. Personal overrides go in `.claude/settings.local.json` or `CLAUDE.local.md` (both gitignored).

## What loads, and when

| Piece | File | When it costs context | What it is for |
| --- | --- | --- | --- |
| Project memory | `CLAUDE.md` -> imports `AGENTS.md` and `GEMINI.md` | Every session | Stack, commands, branch flow, contribution rules |
| Path rules | `.claude/rules/*.md` | Only when Claude touches matching files | API/email, UI, database specifics |
| Skills | `.claude/skills/*/SKILL.md` | Name and description always; body only when used | Repeatable workflows (`/new-section`, `/shadcn-component`, `/ship`, `sql-database`) |
| Subagent | `.claude/agents/achieve-reviewer.md` | Runs in its own context window | Pre-PR review against the house rules |
| Hooks | `.claude/hooks/*.mjs`, wired in `settings.json` | Zero model context; plain Node scripts | Rules that must never be skipped |
| MCP servers | `.mcp.json` | Tool names load on demand | Live Astro docs and the shadcn registry |
| Plugins | `enabledPlugins` in `settings.json` | Varies | TypeScript LSP, security review, Resend skills, Playwright browser |

The split matters: instructions in markdown are requests the model usually follows; hooks are code that always runs. Anything that must never happen (force-pushing `main`) lives in a hook, and anything that is judgement (how to structure a section) lives in markdown.

## The hooks

`guard.mjs` (PreToolUse, before every shell command or file edit)

- Denies: force push, `+refspec` or delete of `main`, `preview`, `dev`; any push to `main`; commit, merge, rebase, cherry-pick, revert or am while on `main`; `vercel --prod`; editing `.env*` or `package-lock.json`.
- Asks: force push to other branches, `git reset --hard`, `git clean -f`, `git checkout .`/`git restore .`, `gh pr merge`.
- Test it with `npm run test:hooks`.

`verify.mjs` (Stop, when Claude finishes a turn)

- If source files changed since the last passing run, runs `npm run check` and `npm test`. Failures are sent back to Claude (exit code 2) so it keeps working until they pass. Passing results are cached by diff fingerprint in `.claude/.cache/`, so chat-only turns cost nothing.

Both run on Windows, macOS and Linux because they are invoked as `node <script>` in exec form, with no shell or `jq` dependency.

## First run for a new contributor

1. Install Claude Code and run `claude` in the repo root. Accept the workspace trust prompt, the project MCP servers and the suggested plugins.
2. Install the TypeScript language server once: `npm install -g typescript-language-server typescript`.
3. Run `/mcp` to confirm `astro-docs` and `shadcn` are connected, and `/plugin` to confirm the plugins loaded.
4. Run `npm run test:hooks` to see the guard rules pass.

## GitHub side

`.github/workflows/ci.yml` runs the same checks (`verify` job) on pushes and pull requests to `dev`, `preview` and `main`. `.github/rulesets/*.json` hold the branch rules; apply or update them with `scripts/github/apply-rulesets.sh` (needs the GitHub CLI and repo admin rights).
