---
paths:
  - "src/pages/api/**"
  - "src/lib/api.ts"
  - "src/types/**"
---

# API routes and email

- Every route under `src/pages/api/` is a Vercel serverless function: keep `export const prerender = false`.
- Validate on the server even when the client already validated. Keep validators as exported pure functions so `src/pages/api/__tests__/` can unit-test them, and add a test for every new validator or edge case.
- Read secrets with `import.meta.env.NAME` and fall back to `process.env.NAME` for Vercel runtime variables. Never hard-code keys, and never log request bodies or secrets.
- Any user-supplied value placed into an HTML email must be HTML-escaped first (`&`, `<`, `>`, `"`, `'`). URLs built from user input must be validated (as `validateAndCleanInstagram` does) before they go into an `href`.
- Return JSON `{ error }` with a 400 for invalid input and a short, generic message with a 500 for unexpected failures. Do not return raw exception messages from third-party SDKs to the browser.
- Keep the request and response shapes in `src/types/apply.ts` in sync with the route, and call the route only through helpers in `src/lib/api.ts`.
- Resend: send from the verified `achieve-coaching.net` domain, set `replyTo` to the applicant, and prefer a plain-text alternative alongside HTML. For anything beyond a simple template, use the Resend plugin's react-email skill.
