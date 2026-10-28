# Repository Guidelines

## Project Structure & Module Organization

This npm workspace contains three apps and one shared package. `apps/web` is the public Astro site; `apps/admin` is the Astro management UI; `apps/api` is the Hono API for Cloudflare Workers. Put shared types, constants, and mock data in `packages/shared/src`. Astro routes live in each app's `src/pages`, with reusable components, layouts, and styles under `src/components`, `src/layouts`, and `src/styles`. API persistence code is in `apps/api/src/lib`, and its D1 schema is in `apps/api/migrations`. See `docs/api/openapi.yaml` for the API contract and `skills/ai-vlog-publisher` for the publishing skill.

## Build, Test, and Development Commands

Use Node.js 20.16 or newer. Run `npm install` at the repository root, then start services separately with `npm run dev:api`, `npm run dev:web`, and `npm run dev:admin`. Their default local ports are 8787, 4321, and 4322, respectively. `npm run check` runs Astro checks and TypeScript validation across workspaces; `npm run build` builds the apps and checks the API. With the API running, use `npm run smoke:api -- http://127.0.0.1:8787` to verify publishing endpoints.

## Coding Style & Naming Conventions

Follow the existing two-space indentation and semicolon style in TypeScript and Astro frontmatter. Use PascalCase for Astro components and layouts (for example, `SiteHeader.astro`), lowercase route directories, and kebab-case utility filenames (for example, `mock-store.ts`). Keep shared API and UI types in `packages/shared` rather than duplicating them. No repository-wide formatter or linter is configured; run `npm run check` before submitting changes.

## Testing Guidelines

There is no dedicated unit-test framework or coverage threshold yet. Validate changes with `npm run check`, `npm run build`, and the API smoke script when endpoints change. For UI changes, inspect the affected route locally in the relevant Astro app. Add focused tests alongside new behavior if a test framework is introduced.

## Commit & Pull Request Guidelines

The available history has only one commit (`deploy test`), so it does not establish a message convention. Use short, imperative commit subjects that name the change. Pull requests should describe the affected app or package, list verification commands and results, link relevant issues, and include screenshots for visible UI changes.

## Security & Configuration

Local admin credentials and placeholder Cloudflare D1/KV IDs appear in `apps/api/wrangler.toml`. Replace them through deployment configuration before publishing; never commit production credentials. Follow `docs/PUBLISHING.md` for release checks and public environment variables.
