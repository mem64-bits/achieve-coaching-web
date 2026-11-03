---
paths:
  - "src/pages/api/**"
  - "src/lib/api.ts"
  - "src/lib/apply/**"
  - "src/types/**"
---

# API routes and email

- Every route under `src/pages/api/` is a Vercel serverless function: keep `export const prerender = false`.
- Validate on the server even when the client already validated. Rules live in `src/lib/apply/schema.ts` (shared with the form); parsing helpers in `phone.ts` and `social.ts`. Add a test in `src/lib/apply/__tests__/` for every new rule or edge case.
- Keep route files thin: read env and construct dependencies (such as `ResendApplicationNotifier`), then call a handler in `src/lib/` that takes those dependencies as arguments. Handlers must be testable without Astro virtual modules.
- Accept only `application/json` bodies, cap the body size, and drop unknown keys. This keeps cross-site form posts out without CSRF tokens.
- Read secrets through `astro:env/server`, declared in `env.schema` in `astro.config.mjs`. Never hard-code keys, and never log request bodies or secrets.
- Any user-supplied value placed into an HTML email must be HTML-escaped first (`&`, `<`, `>`, `"`, `'`). URLs built from user input must be validated (as `validateAndCleanInstagram` does) before they go into an `href`.
- Return JSON `{ error, fieldErrors }` with a 400 for invalid input and a short, generic message with a 5xx for failures. Do not return raw exception messages from third-party SDKs to the browser; log them on the server.
- Keep the request and response shapes in `src/types/apply.ts` in sync with the route, and call the route only through helpers in `src/lib/api.ts`.
- Resend: send from the verified `achieve-coaching.net` domain, set `replyTo` to the applicant, and prefer a plain-text alternative alongside HTML. For anything beyond a simple template, use the Resend plugin's react-email skill.
