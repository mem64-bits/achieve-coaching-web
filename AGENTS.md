# Achieve Coaching Web

Marketing and lead-capture site for Achieve Coaching (achieve-coaching.net). Visitors read about the coaching program and submit an application form; the form posts to a serverless API route that emails the coach through Resend.

Shared instructions for every coding agent (Claude Code, Gemini, Copilot, Junie). Architecture principles were first written in `GEMINI.md`; the maintained version is the "Architecture principles" section of `CLAUDE.md`. Read it before structural changes.

## Stack

- Astro 7 with the Vercel adapter. Pages and layouts are `.astro`; interactive parts are React 19 islands (`.tsx`) hydrated with `client:*` directives.
- Tailwind CSS v4 through `@tailwindcss/vite`. Design tokens are CSS variables in `src/styles/theme.css`, mapped to utilities with `@theme inline`. Global layers live in `src/styles/global.css`.
- shadcn/ui with the `base-nova` style, which is built on Base UI (`@base-ui/react`), not Radix. Generated primitives live in `src/components/ui/`.
- Resend for transactional email from `src/pages/api/apply.ts`.
- libSQL/Turso client prepared in `src/databases/turso.ts` (not used yet; SQL support is planned).
- Vitest for unit tests. `astro check` for type checking `.astro` and `.ts(x)` files.

## Commands

| Task | Command |
| --- | --- |
| Dev server | `npm run dev` (or `astro dev --background`, see below) |
| Type check | `npm run check` |
| Unit tests | `npm test` |
| Production build | `npm run build` |
| Everything CI runs | `npm run verify` |

Node 22.12 or newer. Use `npm`, not pnpm or yarn; `package-lock.json` is the lockfile CI installs from with `npm ci`.

## Branches and deployment

`main` is production on Vercel. Every push to `main` deploys achieve-coaching.net.

```
feature/* or chore/*  ->  dev  ->  preview  ->  main
   (experiments)        (integration) (staging)  (production)
```

- Never commit to, push to, or force-push `main`. It only changes through a pull request from `preview`, after CI passes.
- `preview` holds established concepts ready for the client to see on the preview domain. `dev` holds experiments.
- Never force-push or delete `main`, `preview` or `dev`. Fix mistakes with a new commit (`git revert`), not history rewrites.
- Promotion pull requests (dev -> preview, preview -> main) use merge commits, not squash, so the long-lived branches stay in sync.
- Secrets live in `.env` locally and in Vercel project settings. Never read, print or commit them.

## Contribution rules

From `notes/Achieve Coaching Web Docs & Ideas/Contribution.md`:

1. Never touch `main` directly.
2. Experiments go to `dev`; established concepts go to `preview`.
3. Create, not destroy. Prefer adding over removing. Any deletion of existing code must be called out explicitly and approved before it happens.
4. Comments are written by humans, in their own words. Do not add AI-written code comments.
5. Think OOP and DRY: anything used twice becomes a function, component or layout.

## Conventions

- Read `docs/ARCHITECTURE.md` for the folder map and a "where do I change..." table.
- Content and copy live in `src/constants/` (for example `homeData.ts`, `applyForm.ts`, `results.ts`), not inline in components.
- Page sections are `.astro` files in `src/components/home/`; interactive parts are React islands in feature folders (`src/components/results/`, `src/components/apply/`).
- Every page section uses `SectionContainer` (`src/components/common/SectionContainer.tsx`) and its spacing/width props instead of ad-hoc padding.
- Form validation rules live once in `src/lib/apply/schema.ts` and are shared by the form and the API route.
- Shared types go in `src/types/`; client fetch helpers go in `src/lib/api.ts`.
- Use the `cn()` helper from `src/lib/utils.ts` to merge class names.
- Use theme tokens (`bg-background`, `text-muted-foreground`, `text-achieve-blue`) instead of hard-coded hex colours.
- Import with the path aliases in `tsconfig.json` (`@/`, `@components/`, `@constants/`, `@icons/`, `@images/`).

## Definition of done

1. `npm run check` reports 0 errors.
2. `npm test` passes; new validation or utility logic has a test next to it in `__tests__/`.
3. `npm run build` succeeds.
4. Deletions are listed for the human to approve, and the work is on a non-`main` branch.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
