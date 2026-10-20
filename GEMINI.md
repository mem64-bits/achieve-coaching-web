# Achieve Coaching Web - Project Guidelines & Principles

This file defines the architectural principles, conventions, and modularity guidelines for the Achieve Coaching web application codebase.

## 1. Core Architecture Stack
- **Framework:** Astro (for static layout shell, routing, and Vercel serverless functions).
- **Interactivity:** React (`.tsx`) components loaded via Astro Islands (`client:visible`, `client:load`, etc.).
- **Styling:** Tailwind CSS v4 with custom CSS variables (`theme.css` and `global.css`) providing robust theme and design token support.
- **Backend/API:** Serverless API routes under `src/pages/api/` with strict input validation, sanitization, and Resend email integration.

## 2. Modularity & Organization
- **Constants & Config:** Decouple content from UI components by storing structured data in `src/constants/` (e.g., `homeData.ts`, `socials.ts`, `navigation.ts`).
- **Types:** Keep shared TypeScript interfaces in `src/types/` (e.g., `src/types/apply.ts`).
- **API Clients:** Centralize API fetch helpers in `src/lib/api.ts` with type safety.

## 3. Theming & CSS Principles
- **CSS Custom Properties:** Use CSS variables defined in `src/styles/theme.css` for colors, spacing, and design tokens.
- **Tailwind v4 Integration:** Use `@theme inline` in `theme.css` to map CSS variables to Tailwind utility classes seamlessly.

## 4. Testing & Quality Assurance
- **Unit Testing:** Use `vitest` for testing validation helpers and utility functions (`npm test`).
- **Type Checking & Build:** Always verify builds (`npm run build`) before finalizing changes.

## 5. DRY & Component Design Fundamentals (Section Containers)
- **Reusable Section Containers:** All page sections should utilize the modular `SectionContainer` component (`src/components/ui/SectionContainer.tsx`).
- **Configurable Parameters (OOP Principles):** Encapsulate layout properties (such as max-width, spacing variables, animation hooks, and responsive mobile/desktop flex behavior) as props to ensure maintainability, easy edits, and strict adherence to the DRY principle (Don't Repeat Yourself).
