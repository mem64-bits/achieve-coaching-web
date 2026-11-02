@AGENTS.md

## Architecture principles

Ported from `GEMINI.md`, which stays as Gemini's copy. This section is the maintained version: new rules go here, or in `.claude/rules/` when they only apply to one area of the code.

### 1. Stack boundaries

- Astro owns routing, layouts, the page shell and serverless functions. Files in `src/pages/api/` run as Vercel functions.
- React (`.tsx`) is for UI. Sections without state render to static HTML with no `client:` directive; anything with state or event handlers is an island loaded with `client:visible`, `client:idle` or, only when it must work immediately, `client:load`.
- Styling is Tailwind v4 utilities backed by the CSS variables in `src/styles/theme.css` and the layers in `src/styles/global.css`.
- API routes validate and sanitise every input before calling Resend (or, later, the database).

### 2. Modularity

- Copy and structured data live in `src/constants/` (`homeData.ts`, `socials.ts`, `navigation.ts`). Components import them and never hard-code content.
- Shared TypeScript interfaces live in `src/types/` (for example `apply.ts`), so the API route and the browser use one definition.
- The browser calls APIs only through typed helpers in `src/lib/api.ts`. Components never call `fetch` directly.

### 3. Theming and CSS

- Colours, spacing and radii are CSS custom properties in `src/styles/theme.css`.
- `@theme inline` in `theme.css` maps those variables to Tailwind utilities. A new token means a variable plus its mapping, then the utility in components.
- No raw hex or rgb values in components. The one exception is inline styles in email HTML, which email clients require.

### 4. Testing and quality

- Validation helpers and utilities get Vitest unit tests in a `__tests__/` folder next to the code (`npm test`).
- Work is finished only when `npm run verify` passes (`astro check`, Vitest, `astro build`).

### 5. DRY component design and SectionContainer

- Every page section is wrapped in `SectionContainer` (`src/components/ui/SectionContainer.tsx`).
- Layout behaviour is configured through its props, not rebuilt in each section: `maxWidth`, `spacing`, `paddingTop`, `animationVariant`, `as`, plus `className` for responsive tweaks. Use the presets first; pass explicit sizes only when no preset fits.
- When a section needs layout behaviour the container does not have, add a prop or preset to `SectionContainer` instead of wrapping it or repeating padding and width classes. A change there affects every section, so list the sections it touches and check each one.
- Anything used twice becomes a component or a function. A page structure used twice becomes a layout in `src/layouts/`.

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
- Reuse `AchieveBtn`, `SectionTitle`, `QuoteCard`, `StepRow`, `AchieveImage` and the `ui/` primitives before creating new components.
- For UI changes, run the dev server and check the page with the Playwright MCP tools (desktop and a 390px mobile viewport) before saying it looks right.
- When a fix reveals a rule the codebase was missing, add that rule to this file (or to `.claude/rules/`) in the same change.

### Project skills and agents

- `/new-section <Name>` scaffolds a homepage section the house way.
- `/shadcn-component <name>` adds or adapts a shadcn primitive for base-nova and the Achieve theme.
- `/ship` walks a change through dev -> preview -> main with pull requests.
- `sql-database` loads automatically when work touches SQL, Turso or `src/databases/`.
- The `achieve-reviewer` subagent reviews a diff against the contribution rules. Run it before opening a pull request.

## Clean-base backlog

Work through these one at a time, in order, when the user says "go". Each fix lists any deletions for approval first, passes `npm run verify`, and is committed on its own. Afterwards remove the item from this list and record any new rule above.

1. **Email HTML injection.** `src/pages/api/apply.ts` puts `first_name`, `last_name` and `email` into the notification HTML unescaped, and returns raw Resend and exception messages to the browser. Escape all user input in the template and return a generic error message.
2. **Unoptimised images.** `AchieveImage` renders originals resolved through `import.meta.glob`, so the build ships about 65 MB of images, including a 19.7 MB PNG. Serve them through `astro:assets` with explicit sizes and modern formats.
3. **Wrong `cn` import.** `src/components/ui/select.tsx` imports `cn` from the npm package `cn` instead of `@/lib/utils`. Fix the import, then remove the unused `cn` and `components` dependencies.
4. **Dead code flagged by `astro check`.** Unused `AchieveBtn` imports in `ResultsMosaicSection.tsx` and `BaseLayout.astro`, unused `gmailIcon` in `src/constants/socials.ts` (which also has an uncommitted edit; leave that edit alone), and the deprecated `React.FormEvent` type in `ContactFormSection.tsx`.
5. **No sitemap.** `astro.config.mjs` has no `site`, so `@astrojs/sitemap` skips generation. Set it to the production domain.
6. **Line endings.** Add a `.gitattributes` (`* text=auto eol=lf`) and renormalise, so Windows and Linux tools agree. `ResultsMosaicSection.tsx` is currently stored with CRLF.
7. **Possible leftover.** `src/template.html` (425 lines) is not imported anywhere. Ask whether it is still needed before removing it.
