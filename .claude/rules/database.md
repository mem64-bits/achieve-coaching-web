---
paths:
  - "src/databases/**"
  - "src/db/**"
  - "drizzle/**"
  - "migrations/**"
  - "**/*.sql"
---

# Database code

- The planned database is Turso (libSQL, SQLite dialect). The client in `src/databases/turso.ts` uses `@libsql/client/web`, which works in Vercel serverless functions.
- Always use parameterised queries (`turso.execute({ sql, args })`). Never build SQL by concatenating or templating user input.
- Database access happens only on the server: API routes, Astro actions, or pages with `prerender = false`. Never import the client into a React island.
- Schema changes are migrations checked into the repo, never ad-hoc statements against production. Ask before running any `DROP`, `DELETE` without `WHERE`, or a migration against a non-local database.
- Credentials come from `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`, set separately for Preview and Production in Vercel so preview deployments never write to the production database.
