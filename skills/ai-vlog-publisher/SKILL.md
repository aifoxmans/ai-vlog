---
name: ai-vlog-publisher
description: Publish and operate the AI Vlog platform as a reusable Codex Skill and HTTP API. Use when Codex needs to prepare public releases, verify deployment readiness, call or document AI Vlog content/admin APIs, publish content through the admin API, validate OpenAPI contracts, or package this repository's Skill for external agents.
---

# AI Vlog Publisher

## Core Workflow

1. Discover capabilities from `GET /api/capabilities` or `GET /api/skill/manifest`.
2. Read `references/api-contract.md` before writing API integrations or external docs.
3. Use public APIs for read-only site consumption and admin APIs only after login.
4. Run `scripts/api_smoke.mjs` before declaring the API publishable.
5. Use `docs/PUBLISHING.md` when preparing release notes, environment variables, and deployment checks.

## Public API Use

Use the public endpoints without authentication:

```bash
curl http://127.0.0.1:8787/api/capabilities
curl http://127.0.0.1:8787/api/public/home
curl "http://127.0.0.1:8787/api/public/content?section=learn&limit=5"
```

Public data is suitable for site rendering, external search, lightweight ingestion, and agent browsing.

## Admin API Use

Login first, then pass the returned token as `Authorization: Bearer <token>`.

```bash
curl -X POST http://127.0.0.1:8787/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Use admin APIs for content CRUD, taxonomy updates, settings updates, and dashboard data. Do not call admin mutation endpoints without checking whether the target environment is local, staging, or production.

## Release Verification

Run these checks before publication:

```bash
npm run check --workspaces --if-present
npm run smoke:api -- http://127.0.0.1:8787
```

For a deployed environment:

```bash
npm run smoke:api -- https://api.example.com
```

## Resources

- `references/api-contract.md`: concise API contract and payload notes.
- `scripts/api_smoke.mjs`: API readiness smoke test.
- `docs/api/openapi.yaml`: static OpenAPI 3.1 document for publication.
- `GET /api/openapi.json`: runtime OpenAPI 3.1 document with the current base URL.
