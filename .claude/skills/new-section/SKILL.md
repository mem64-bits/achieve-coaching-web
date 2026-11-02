---
name: new-section
description: Scaffold a new homepage section for the Achieve Coaching site using the house pattern (typed copy in src/constants, an .astro section wrapped in SectionContainer, barrel export, placement in HomePageTemplate). Use when adding or splitting out a page section.
argument-hint: "[SectionName] [short purpose]"
when_to_use: "add a testimonials section", "new FAQ section on the home page", "split the hero into its own section"
---

# New homepage section: $0

Purpose from the user: $ARGUMENTS

## Current state

- Existing sections: !`node -e "console.log(require('fs').readdirSync('src/components/home').filter(f=>f.endsWith('Section.astro')).join(', '))"`
- Page order in HomePageTemplate.astro: !`node -e "const s=require('fs').readFileSync('src/layouts/HomePageTemplate.astro','utf8');console.log((s.match(/<[A-Z][A-Za-z]+Section[^>]*\/>/g)||[]).join(' -> '))"`

## Steps

1. Confirm with the user where the section goes in the page order and what content it shows. Do not invent client copy; use placeholders marked `TODO copy` if the user has none yet.
2. Content: add a typed, exported constant (for example `FAQ_SECTION`) to `src/constants/homeData.ts`, or a new sibling file if it is a separate feature. Images are imported as modules (`import photo from "@images/name.jpg"`); a file that imports images is server-only, so never import it from an island.
3. Section: create `src/components/home/$0Section.astro`.
   - Wrap it in `SectionContainer` from `@components/common/SectionContainer` with an `id` from `SECTION_IDS` in `src/constants/site.ts` and `aria-labelledby` pointing at the heading id. Choose `maxWidth`, `spacing` and `animationVariant` presets that match neighbouring sections.
   - Start with `SectionTitle` and reuse `AchieveBtn`, `QuoteCard`, `StepRow`, the `effects/` components and `src/components/ui/` primitives before writing new markup.
   - Style with theme tokens and fluid utilities (`text-title`, `text-lead`, `px-gutter`). No hex colours, no copy in the markup.
   - Images: `<Picture>` from `astro:assets` with `widths` and `sizes`, lazy by default.
4. Interactivity: if part of the section needs state or events, put that part in a React island under a feature folder (`src/components/<feature>/`), pass it plain data, and load it with `client:visible={{rootMargin: "400px"}}`. Keep the rest static.
5. Export the section from `src/components/home/index.ts` and render it in `src/layouts/HomePageTemplate.astro` at the agreed position.
6. Add a row for it to the "Where do I change..." table in `docs/ARCHITECTURE.md`.
7. Verify: `npm run verify`, then check the page with the Playwright MCP tools at 360px, 390px and 1280px. Confirm there is no horizontal scroll and no hydration error in the console of a production build.

Do not add code comments; contributors write their own.
