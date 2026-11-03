---
name: sql-database
description: Add or change SQL database features for the Achieve Coaching site using Turso (libSQL/SQLite) from Astro server code on Vercel, with migrations and parameterised queries. Use for storing applications, leads, testimonials or any persisted data, or when the user mentions SQL, Turso, libSQL, Drizzle or a database.
paths:
  - "src/databases/**"
  - "src/pages/api/**"
  - "**/*.sql"
---

# SQL database work

The repo already depends on `@libsql/client` and exports a client from `src/databases/turso.ts` that reads `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. Nothing uses it yet.

## Before writing code

1. Confirm the goal with the user: what data, who writes it, who reads it, and how long it is kept. Contact-form data is personal data; ask whether it must be deleted after a period.
2. Check the current libSQL client API with Context7 (`/tursodatabase/libsql-client-ts`) and, if the user wants an ORM, Drizzle's libSQL guide. State the versions you checked.
3. Propose the schema as SQL and wait for approval before creating anything.

## Implementation pattern

- Keep the schema in `migrations/NNNN_description.sql` (or Drizzle schema plus generated migrations if the user picks Drizzle). Migrations are additive; dropping a column or table needs explicit approval.
- Put queries in small typed functions under `src/databases/` (for example `src/databases/applications.ts`) and call them only from API routes or other server code with `prerender = false`.
- Use parameterised statements only: `turso.execute({ sql: "INSERT INTO applications (email) VALUES (?)", args: [email] })`. Use `turso.batch([...], "write")` when several writes must succeed together.
- Validate input with the existing validators before it reaches the database, and unit-test the query functions against a local file database (`file:local.db`) in Vitest.
- Separate databases for local, Preview and Production. Add the two env vars for each environment in Vercel; never point a preview deployment at the production database.
- Never run migrations or destructive statements against a remote database without the user confirming the target URL first.

## Verify

`npm run check`, `npm test`, `npm run build`, then exercise the route locally and show the user the stored row.
