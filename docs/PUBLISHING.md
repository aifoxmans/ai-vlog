# AI Vlog Publishing Interface

This repository exposes two publishable surfaces:

- **Skill capability**: `skills/ai-vlog-publisher`, a Codex Skill package for agents that need to operate or integrate the platform.
- **HTTP interface capability**: Hono/Workers API endpoints under `apps/api`, including discovery and OpenAPI routes.

## Local Services

```bash
npm install
npm run dev:api
npm run dev:web
npm run dev:admin
```

Default local URLs:

- Web: `http://127.0.0.1:4321`
- Admin UI: `http://127.0.0.1:4322`
- API: `http://127.0.0.1:8787`

## Capability Discovery

External callers should start with:

```bash
curl http://127.0.0.1:8787/api/capabilities
curl http://127.0.0.1:8787/api/skill/manifest
curl http://127.0.0.1:8787/api/openapi.json
```

Static API documentation is available at `docs/api/openapi.yaml`.

## Skill Publication

Publish the folder `skills/ai-vlog-publisher` as the Skill package.

Required entrypoint:

- `skills/ai-vlog-publisher/SKILL.md`

Included resources:

- `skills/ai-vlog-publisher/references/api-contract.md`
- `skills/ai-vlog-publisher/scripts/api_smoke.mjs`
- `skills/ai-vlog-publisher/agents/openai.yaml`

## API Publication

Public endpoints do not require authentication. Admin endpoints require a bearer token returned from `POST /api/admin/auth/login`.

Local login body:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Production should override credentials through Workers variables:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Production should also replace placeholder Cloudflare resource IDs in `apps/api/wrangler.toml`.

## Verification

Run before release:

```bash
npm run check --workspaces --if-present
npm run smoke:api -- http://127.0.0.1:8787
python C:/Users/imzha/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/ai-vlog-publisher
```

For deployed API:

```bash
npm run smoke:api -- https://api.example.com
```

## Release Checklist

- API responds on `/api/capabilities`.
- API responds on `/api/openapi.json`.
- Static `docs/api/openapi.yaml` is included in the release artifact.
- Skill folder validates with `quick_validate.py`.
- Admin credentials are not the local defaults in production.
- Wrangler D1/KV IDs are real production resources.
- Web `PUBLIC_API_BASE_URL` points to the published API.
- Web `PUBLIC_ADMIN_APP_URL` points to the published admin UI.
