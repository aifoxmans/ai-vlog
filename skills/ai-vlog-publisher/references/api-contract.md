# AI Vlog API Contract

Base URL defaults to `http://127.0.0.1:8787` in local development.

## Discovery

- `GET /api/capabilities`: machine-readable capability manifest.
- `GET /api/skill/manifest`: alias for external agents expecting a skill manifest path.
- `GET /api/openapi.json`: runtime OpenAPI 3.1 contract using the request origin.
- Static publication copy: `docs/api/openapi.yaml`.

## Public Endpoints

- `GET /`: health metadata.
- `GET /api/public/navigation`: navigation items and site settings.
- `GET /api/public/home`: featured/latest content, section cards, tags and settings.
- `GET /api/public/sections`: section labels, URLs, summaries and counts.
- `GET /api/public/content`: published content list.
- `GET /api/public/content/:slug`: published content detail.
- `GET /api/public/tags`: tag list.
- `GET /api/public/tags/:slug`: published content for a tag.
- `GET /api/public/categories`: category list, optional `section`.
- `GET /api/public/categories/:slug`: published content for a category.
- `GET /api/public/archive`: monthly archive.
- `GET /api/public/search?q=...`: search published content.

`/api/public/content` accepts `section`, `tag`, `category`, `search`, and `limit`.

## Admin Endpoints

Admin endpoints require `Authorization: Bearer <token>` except login.

- `POST /api/admin/auth/login`: body `{ "username": "...", "password": "..." }`.
- `POST /api/admin/auth/logout`: destroy current token.
- `GET /api/admin/dashboard`: stats, recent content and settings.
- `GET /api/admin/contents`: list admin content, optional `section`, `status`, `search`.
- `GET /api/admin/contents/:id`: content detail by id.
- `POST /api/admin/contents`: create content.
- `PUT /api/admin/contents/:id`: update content.
- `DELETE /api/admin/contents/:id`: delete content.
- `GET /api/admin/categories`: admin category list.
- `POST /api/admin/categories`: upsert category.
- `GET /api/admin/tags`: admin tag list.
- `POST /api/admin/tags`: upsert tag.
- `GET /api/admin/settings`: site settings.
- `PUT /api/admin/settings`: update site settings.

## Content Mutation Shape

Minimum content body:

```json
{
  "section": "learn",
  "status": "draft",
  "slug": "example-slug",
  "title": "Example title",
  "excerpt": "At least ten characters.",
  "bodyMarkdown": "At least ten characters.",
  "tagSlugs": []
}
```

Optional fields include `id`, `categorySlug`, `coverImage`, `coverAlt`, `featured`, `readingTime`, `publishedAt`, `seoTitle`, `seoDescription`, `ogImage`, `videoPlatform`, `videoEmbedUrl`, `videoPosterUrl`, and `videoDurationSeconds`.

## Local Defaults

- Admin username: `admin`
- Admin password: `admin123`
- Web: `http://127.0.0.1:4321`
- Admin UI: `http://127.0.0.1:4322`
- API: `http://127.0.0.1:8787`
