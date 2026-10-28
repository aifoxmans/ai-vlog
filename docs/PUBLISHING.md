# AI Vlog Publishing Interface

This repository exposes two publishable surfaces:

- **Skill capability**: `skills/ai-vlog-publisher`, a Codex Skill package for agents that need to operate or integrate the platform.
- **HTTP interface capability**: Hono/Workers API endpoints under `apps/api`, including discovery and OpenAPI routes.

## Local Services

```bash
npm install
cp apps/api/.dev.vars.example apps/api/.dev.vars
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

Production uses `ADMIN_USERNAME` from `apps/api/wrangler.toml` and an `ADMIN_PASSWORD` Worker secret. The local `admin123` fallback is disabled in production.

## Cloudflare Workers Deployment

The repository deploys three Workers to the `aiid.qzz.io` zone:

- Public site: `https://vlog.aiid.qzz.io` (`apps/web`)
- API: `https://api-vlog.aiid.qzz.io` (`apps/api`)
- Admin UI: `https://admin-vlog.aiid.qzz.io/login` (`apps/admin`)

`apps/api/wrangler.toml` binds the dedicated `ai-vlog` D1 database and `ai-vlog-cache` and `ai-vlog-sessions` KV namespaces. The GitHub workflow `.github/workflows/deploy-workers.yml` runs checks and builds on a GitHub runner, applies D1 migrations, deploys the API, admin, and public Workers, then checks their URLs. It runs on pushes to `master` and can be started manually.

Configure these GitHub Actions secrets: `CF_ACCOUNT_ID`, `CF_API_TOKEN`, and `ADMIN_PASSWORD`. Configure these repository variables: `PUBLIC_API_BASE_URL=https://api-vlog.aiid.qzz.io` and `PUBLIC_ADMIN_APP_URL=https://admin-vlog.aiid.qzz.io/login`. The Cloudflare token needs permission to deploy Workers and apply D1 migrations in the account and manage Worker custom domains for `aiid.qzz.io`. Keep the password in both the GitHub secret and the API Worker's `ADMIN_PASSWORD` secret.

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
- D1/KV bindings point to the dedicated production resources.
- Web `PUBLIC_API_BASE_URL` points to the published API.
- Web `PUBLIC_ADMIN_APP_URL` points to the published admin UI.
