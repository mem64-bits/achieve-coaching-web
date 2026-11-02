---
name: new-section
description: Scaffold a new homepage section for the Achieve Coaching site using the house pattern (typed copy in homeData.ts, a React section component wrapped in SectionContainer, barrel export, placement in HomePageTemplate). Use when adding or splitting out a page section.
argument-hint: "[SectionName] [short purpose]"
when_to_use: "add a testimonials section", "new FAQ section on the home page", "split the hero into its own section"
---

# New homepage section: $0

Purpose from the user: $ARGUMENTS

## Current state

- Existing sections: !`node -e "console.log(require('fs').readdirSync('src/components/home').filter(f=>f.endsWith('Section.tsx')).join(', '))"`
- Page order in HomePageTemplate.astro: !`node -e "const s=require('fs').readFileSync('src/layouts/HomePageTemplate.astro','utf8');console.log((s.match(/<[A-Z][A-Za-z]+Section[^>]*\/>/g)||[]).join(' -> '))"`

## Steps

1. Confirm with the user where the section goes in the page order and what content it shows. Do not invent client copy; use placeholders marked `TODO copy` if the user has none yet.
2. Content: add a typed, exported constant (for example `FAQ_ITEMS`) with its interface to `src/constants/homeData.ts`. Images are referenced by filename and resolved with `getImageUrl`.
3. Component: create `src/components/home/$0Section.tsx` as a named export.
   - Wrap the markup in `SectionContainer` with an `id` (used for `#anchor` links) and `className="scroll-mt-24"`; choose `maxWidth` and `spacing` presets that match neighbouring sections.
   - Start with `SectionTitle` for the heading and reuse `AchieveBtn`, `QuoteCard`, `StepRow`, `AchieveImage` and `src/components/ui/` primitives before writing new markup.
   - Style with theme tokens and the existing utility classes from `global.css` (`achieve-h2`, `lab`, `a`).
   - Map over the constant from step 2; no hard-coded copy in JSX.
4. Export it from `src/components/home/index.ts`.
5. Render it in `src/layouts/HomePageTemplate.astro` at the agreed position. Sections render as static HTML with no `client:` directive unless they hold state or event handlers; if they do, use `client:visible`.
6. If the header navigation should link to it, add the anchor to `src/constants/navigation.ts`.
7. Verify: `npm run check`, then start the dev server and inspect the section with the Playwright MCP tools at 390px and 1280px widths. Report anything that overflows or breaks the vertical rhythm.

Do not add code comments; contributors write their own.
