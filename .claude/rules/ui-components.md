---
paths:
  - "src/components/**"
  - "src/layouts/**"
  - "src/pages/**/*.astro"
  - "src/styles/**"
---

# Components, layouts and styling

- Default to `.astro` components; reach for a React island only when the UI needs client state or events. Pick the lightest hydration that works: `client:visible` (with a `rootMargin`) for below-the-fold widgets, `client:idle` for non-urgent ones, `client:load` only when it must be interactive immediately.
- Island props must be plain, serialisable data. Islands never import image modules or `src/constants/resultPhotos.ts`; optimise images in the `.astro` parent with `toResponsiveImage()` from `src/lib/images.ts` and pass the result down.
- Sections: `src/components/home/<Name>Section.astro`, wrapped in `SectionContainer` (`src/components/common/`) with `maxWidth`, `spacing` and `paddingTop` presets before arbitrary values. Register new home sections in `src/components/home/index.ts`.
- Copy, image lists, steps and testimonials belong in `src/constants/` (`homeData.ts`, `results.ts`, `resultPhotos.ts`, `applyForm.ts` or a new sibling file), typed, and imported by the component.
- Colours, radii and fonts come from tokens in `src/styles/theme.css`. Add a token there (and map it in `@theme inline`) instead of hard-coding a hex value in a component. The brand palette is AMOLED black backgrounds with Achieve blue accents; gold only for rare emphasis.
- `src/components/ui/` contains shadcn base-nova primitives. Prefer composing them over editing them; if a primitive must change, say so explicitly in the summary.
- Images: `<Picture>` or `<Image>` from `astro:assets` in `.astro` files, `toResponsiveImage()` for images an island renders. Always give `widths` and an accurate `sizes`, keep `fetchpriority="high"` for the one hero image only, and lazy-load everything else.
- Text sizes and spacing use the fluid tokens (`text-display`, `text-title`, `text-lead`, `px-gutter`, `pb-section`). Rows that pair a logo or text with a button need `min-w-0` on the shrinking side and `shrink-0` on the button.
- Effects come from `src/components/effects/` and must stay decorative (`aria-hidden`, `motion-safe:`).
- Accessibility basics on every change: one `h1` per page, labelled form controls, visible focus states, alt text that describes the image, colour contrast that passes WCAG AA on the black background, and interactive elements that are real buttons or links.
- Check mobile first. The site is mostly visited from phones via Instagram and WhatsApp links. Test at 360px and 390px, confirm there is no horizontal scroll, and test a production build for hydration errors.
