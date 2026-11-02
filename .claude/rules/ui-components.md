---
paths:
  - "src/components/**"
  - "src/layouts/**"
  - "src/pages/**/*.astro"
  - "src/styles/**"
---

# Components, layouts and styling

- Default to `.astro` components; reach for a React island only when the UI needs client state or events. Pick the lightest hydration that works: `client:visible` for below-the-fold widgets, `client:idle` for non-urgent ones, `client:load` only when it must be interactive immediately.
- Sections: wrap in `SectionContainer` and choose `maxWidth`, `spacing` and `paddingTop` presets before reaching for arbitrary values. Register new home sections in `src/components/home/index.ts`.
- Copy, image lists, steps and testimonials belong in `src/constants/homeData.ts` (or a sibling constants file), typed, and imported by the component.
- Colours, radii and fonts come from tokens in `src/styles/theme.css`. Add a token there (and map it in `@theme inline`) instead of hard-coding a hex value in a component. The brand palette is AMOLED black backgrounds with Achieve blue accents; gold only for rare emphasis.
- `src/components/ui/` contains shadcn base-nova primitives. Prefer composing them over editing them; if a primitive must change, say so explicitly in the summary.
- Images go through `AchieveImage` or Astro's `<Image />` with explicit width and height so layout does not shift.
- Accessibility basics on every change: one `h1` per page, labelled form controls, visible focus states, alt text that describes the image, colour contrast that passes WCAG AA on the black background, and interactive elements that are real buttons or links.
- Check mobile first. The site is mostly visited from phones via Instagram and WhatsApp links.
