# Effects

Decorative, CSS-driven effects adapted from [Magic UI](https://magicui.design) (MIT licence, see `THIRD_PARTY_NOTICES.md` in the repository root).

| Component | Source | Used by |
| --- | --- | --- |
| `ShimmerLayers` | Magic UI `shimmer-button`, split into layers so it can sit inside any button or link | `AchieveBtn` with `effect="shimmer"` |
| `ShineBorder` | Magic UI `shine-border` | `QuoteCard`, the apply form card |

Rules for this folder:

- Effects are purely visual. They are `aria-hidden`, ignore pointer events and must never carry meaning.
- Animations run only under `motion-safe:` so visitors who ask for reduced motion get a still version.
- The keyframes live in `src/styles/theme.css` (`shimmer-slide`, `spin-around`, `shine`), which is where Magic UI's registry puts them for Tailwind v4.
- Prefer CSS-only effects. Magic UI components that need the `motion` package (for example `border-beam`, `blur-fade`) were left out to keep the mobile bundle small.
- To add another Magic UI effect, run `npx shadcn@latest add "https://magicui.design/r/<name>.json"`, then move the file here and swap hard-coded colours for theme tokens.
