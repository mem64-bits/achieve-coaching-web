@AGENTS.md
@GEMINI.md

## Claude Code

### Look things up before writing framework code

Astro 7, Tailwind 4, React 19, shadcn base-nova and Resend all changed recently, so training data is often stale.

- Astro questions: use the `astro-docs` MCP server (`search_astro_docs`) before writing routing, islands, actions, middleware or adapter code.
- shadcn components: use the `shadcn` MCP server to search and view registry items, then install with the add command it returns. Never hand-copy component source from memory; base-nova uses Base UI APIs, which differ from Radix.
- Any other library: use Context7 (`resolve-library-id`, then `query-docs`) and state which version you checked.
- When the user is learning a concept, explain why the chosen approach works and what the alternatives were.

### Guard rails that are enforced, not just requested

- `.claude/hooks/guard.mjs` blocks force pushes and deletion of `main`, `preview` and `dev`, any direct push to `main`, commits or merges while on `main`, production CLI deploys, and edits to `.env*` or `package-lock.json`. Destructive local git commands (`reset --hard`, `clean -f`, `checkout .`) and `gh pr merge` ask first. If the guard blocks you, change approach; do not look for a workaround.
- `.claude/hooks/verify.mjs` runs `astro check` and `vitest` when you finish a turn that changed source files. If it reports failures, fix them before summarising.
- `.env` files are unreadable to you. Ask the user for a value's name, never its contents.

### How to work in this repo

- Start feature work on a branch off `dev` (`git switch dev && git switch -c feature/<name>`), or in a worktree with `claude --worktree <name>`.
- Before deleting or rewriting existing code, list what will be removed and wait for approval (contribution rule 3).
- Do not write code comments. If something non-obvious needs a comment, tell the user where and what it should explain so they can write it in their own words.
- Keep copy in `src/constants/`, wrap sections in `SectionContainer`, and reuse `AchieveBtn`, `SectionTitle` and existing `ui/` primitives before creating new ones.
- For UI changes, run the dev server and check the page with the Playwright MCP tools (desktop and a 390px mobile viewport) before saying it looks right.

### Project skills and agents

- `/new-section <Name>` scaffolds a homepage section the house way.
- `/shadcn-component <name>` adds or adapts a shadcn primitive for base-nova and the Achieve theme.
- `/ship` walks a change through dev -> preview -> main with pull requests.
- `sql-database` loads automatically when work touches SQL, Turso or `src/databases/`.
- The `achieve-reviewer` subagent reviews a diff against the contribution rules. Run it before opening a pull request.

### Known issues to keep in mind

- `astro.config.mjs` has no `site` value, so `@astrojs/sitemap` skips generating a sitemap.
- The notification email in `src/pages/api/apply.ts` interpolates form input into HTML without escaping. Escape user input in any email template you touch.
