@AGENTS.md

## Architecture principles

Ported from `GEMINI.md`, which stays as Gemini's copy. This section is the maintained version: new rules go here, or in `.claude/rules/` when they only apply to one area of the code.

### 1. Stack boundaries

- Astro owns routing, layouts, the page shell and serverless functions. Files in `src/pages/api/` run as Vercel functions.
- Page sections are `.astro` files (`src/components/home/*Section.astro`). They render to static HTML and can use `astro:assets` for images.
- React (`.tsx`) is for interactive islands and for small presentational components shared by sections and islands (`AchieveBtn`, `SectionTitle`, `QuoteCard`, `StepRow`). Islands load with `client:visible` (with a `rootMargin` so they hydrate just before they are seen), `client:idle`, or, only when they must work immediately, `client:load`.
- Island props are serialised into the HTML: pass plain data only. No functions, class instances or image imports.
- Styling is Tailwind v4 utilities backed by the CSS variables in `src/styles/theme.css` and the layers in `src/styles/global.css`.
- API routes validate and sanitise every input before calling Resend (or, later, the database).

### 2. Modularity

- Copy and structured data live in `src/constants/` (`site.ts`, `homeData.ts`, `results.ts`, `resultPhotos.ts`, `applyForm.ts`, `socials.ts`, `navigation.ts`). Components import them and never hard-code content.
- Constants files that import images (`homeData.ts`, `resultPhotos.ts`) are server-only. Islands never import them; `.astro` files optimise the images and pass plain data down.
- Components are grouped by feature: `layout/` (header, footer), `home/` (sections), `results/` and `apply/` (islands and their parts), `common/` (shared building blocks), `effects/` (decorative), `ui/` (shadcn primitives). `docs/ARCHITECTURE.md` has a "where do I change..." table; keep it current.
- Shared TypeScript interfaces live in `src/types/` (for example `apply.ts`, `images.ts`, `results.ts`), so the API route and the browser use one definition.
- The browser calls APIs only through typed helpers in `src/lib/api.ts`. Components never call `fetch` directly.
- Validation rules live once, in `src/lib/apply/schema.ts`, and are used by both the form (through `zodResolver`) and the API route. Never write a second copy of a rule in a component.
- Server logic depends on interfaces, not SDKs: `handleApplicationRequest` receives an `ApplicationNotifier`, and only `notifier.ts` knows about Resend. Keep API routes as thin wrappers so the logic stays unit-testable.

### 3. Theming and CSS

- Colours, spacing and radii are CSS custom properties in `src/styles/theme.css`.
- `@theme inline` in `theme.css` maps those variables to Tailwind utilities. A new token means a variable plus its mapping, then the utility in components.
- No raw hex or rgb values in components. The one exception is inline styles in email HTML, which email clients require.
- Type and spacing are fluid tokens (`text-display`, `text-title`, `text-subtitle`, `text-lead`, `px-gutter`, `pt-section`, `pb-section`, `p-card`) built on `--col`, 1% of the page column. Use them instead of stacking breakpoint font sizes.
- One layout for every screen (the client's call): desktop is the phone layout in a centred column (`max-w-column`, 37.5rem) that scales up. Do not add `md:`/`lg:` layout changes (side-by-side columns, grids, hiding the carousel arrows). `sm:` is only for small fits such as the header's long link labels; pop-ups like the country picker may still differ.
- New sizes that should scale with the layout are written as `calc(var(--col) * N)`, where N is the size on a 390px phone divided by 3.9. A phone must look the same before and after any change; compare a 390px screenshot.
- Every flex row that holds a logo or long text next to a button needs `min-w-0` on the text side and `shrink-0` on the button side.
- Form inputs are at least 16px (`text-base`) so iOS Safari does not zoom, and tap targets are at least 44px tall (48px or more for form controls).
- Motion runs only under `motion-safe:` or `@media (prefers-reduced-motion: no-preference)`. Newer CSS (scroll-driven animations, `scroll-state` queries) is a progressive enhancement: the page must look complete without it.

### 4. Testing and quality

- Validation helpers and utilities get Vitest unit tests in a `__tests__/` folder next to the code (`npm test`).
- Work is finished only when `npm run verify` passes (`astro check`, Vitest, `astro build`).

### 5. DRY component design and SectionContainer

- Every page section is wrapped in `SectionContainer` (`src/components/common/SectionContainer.tsx`).
- Layout behaviour is configured through its props, not rebuilt in each section: `maxWidth`, `spacing`, `paddingTop`, `animationVariant` (`fade` or `slide` scroll reveal), `as`, plus `className` for responsive tweaks. Use the presets first; pass explicit sizes only when no preset fits.
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
- Reuse `AchieveBtn` (variants, sizes, `effect="shimmer"`), `SectionContainer`, `SectionTitle`, `QuoteCard`, `StepRow`, the `effects/` components and the `ui/` primitives before creating new components.
- For UI effects, look at Magic UI (MIT, shadcn-compatible) first and prefer CSS-only components; record anything adapted in `THIRD_PARTY_NOTICES.md` and `src/components/effects/README.md`.
- For UI changes, run the dev server and check the page with the Playwright MCP tools (desktop and a 390px mobile viewport) before saying it looks right. Also check that `document.documentElement.scrollWidth` equals the viewport width at 360px.
- Check hydration on a production build (`npm run build`, then serve `.vercel/output/static`), not only in `astro dev`: some mismatches only appear after the build.
- Heavy client libraries load on demand with `React.lazy` or `import()` (Swiper only loads when the photo viewer opens). Do not add one to an island's main bundle without measuring the gzipped size first.
- Section links in the header must live inside a `[data-section-nav]` nav and use the `section-link` class, so `SectionSpy` and the lamp styles pick them up. Style the current link with `:is(:target-current, .target-current)` (never two separate selectors: an unknown pseudo-class drops the whole rule).
- Don't remove `InPageJumps` while `deferRender` is in use: `#section` links rely on it to land on the right spot.
- Looping decorative motion runs a few times and then rests; nothing should animate forever in the header.
- Loading and broken-image states use `BrandLoader` (`state="loading"` or `"idle"`); do not add other spinners.
- Section sub-headings use the `eyebrow-pill` class, list bullets use `bullet-mark`, and short highlights use `chip`. Reuse them instead of adding tick icons.
- Do not turn on `astro-compress` HTML minification. It rewrites the text markers React uses for hydration (see `docs/ARCHITECTURE.md`).
- When a fix reveals a rule the codebase was missing, add that rule to this file (or to `.claude/rules/`) in the same change.

### Project skills and agents

- `/new-section <Name>` scaffolds a homepage section the house way.
- `/shadcn-component <name>` adds or adapts a shadcn primitive for base-nova and the Achieve theme.
- `/ship` walks a change through dev -> preview -> main with pull requests.
- `sql-database` loads automatically when work touches SQL, Turso or `src/databases/`.
- The `achieve-reviewer` subagent reviews a diff against the contribution rules. Run it before opening a pull request.

## Clean-base backlog

Work through these one at a time when the user says "go". Each fix lists any deletions for approval first, passes `npm run verify`, and is committed on its own. Afterwards remove the item from this list and record any new rule above.

1. **Dead import.** `src/constants/socials.ts` still imports `gmailIcon` without using it. The file also has an uncommitted edit on the user's machine; leave that edit alone and ask before touching the file.
2. **Line endings.** Add a `.gitattributes` (`* text=auto eol=lf`) so Windows and Linux tools agree. Do it on a branch with a clean working tree, because changing line-ending rules can make Git report every file as modified until it is renormalised.
3. **Possible leftover.** `src/template.html` (425 lines) is not imported anywhere. Ask whether it is still needed before removing it.
4. **Large originals.** `src/assets/images/` holds about 65 MB of originals (one PNG is 19.7 MB). Visitors only get resized copies, but replacing the originals with 2400px JPEG or WebP masters would speed up clones and builds. Ask before replacing the client's photos.
