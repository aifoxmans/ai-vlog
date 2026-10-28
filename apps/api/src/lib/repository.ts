import {
  archiveEntries,
  getContentBySlug as getSharedContentBySlug,
  homePayload,
  navigationItems,
  sectionMeta
} from "@ai-vlog/shared";
import type {
  ArchiveEntry,
  Category,
  ContentDetail,
  ContentItem,
  DashboardStats,
  HomePayload,
  NavigationItem,
  PublicSection,
  SiteSettings,
  Tag
} from "@ai-vlog/shared";
import { marked } from "marked";
import {
  getMockCategories,
  getMockContents,
  getMockSettings,
  getMockStats,
  getMockTags,
  setMockCategories,
  setMockContents,
  setMockSettings,
  setMockTags
} from "./mock-store";
import type { ApiEnv } from "./auth";

marked.setOptions({
  gfm: true,
  breaks: false
});

export interface ContentFilters {
  section?: string;
  status?: string;
  search?: string;
  tag?: string;
  category?: string;
  limit?: number;
}

export interface ContentMutationInput {
  id?: string;
  section: string;
  status: string;
  slug: string;
  title: string;
  excerpt: string;
  bodyMarkdown: string;
  categorySlug?: string;
  tagSlugs?: string[];
  coverImage?: string;
  coverAlt?: string;
  featured?: boolean;
  readingTime?: number;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  videoPlatform?: string;
  videoEmbedUrl?: string;
  videoPosterUrl?: string;
  videoDurationSeconds?: number;
}

export interface CategoryMutationInput {
  id?: string;
  name: string;
  slug: string;
  section: PublicSection;
  description?: string;
  accent?: string;
}

export interface TagMutationInput {
  id?: string;
  name: string;
  slug: string;
}

function isCloudflareBound(c: ApiEnv["Bindings"]) {
  return Boolean(c.DB);
}

const dbReadyCache = new WeakMap<D1Database, Promise<boolean>>();

async function canUseDatabase(env: ApiEnv["Bindings"]) {
  if (!isCloudflareBound(env) || !env.DB) {
    return false;
  }

  const cached = dbReadyCache.get(env.DB);
  if (cached) {
    return cached;
  }

  const readiness = env.DB.prepare(
    `SELECT name
     FROM sqlite_master
     WHERE type = 'table' AND name IN ('contents', 'categories', 'tags')`
  )
    .all<{ name: string }>()
    .then((result) => {
      const names = new Set((result.results || []).map((row) => String(row.name)));
      return ["contents", "categories", "tags"].every((name) => names.has(name));
    })
    .catch(() => false);

  dbReadyCache.set(env.DB, readiness);
  return readiness;
}

function toBoolean(value: unknown) {
  return Number(value) === 1 || value === true;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (!value || typeof value !== "string") {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function hydrateBody(item: ContentDetail): ContentDetail {
  return {
    ...item,
    bodyHtml: marked.parse(item.bodyMarkdown) as string
  };
}

function matchSearch(item: ContentDetail, search?: string) {
  if (!search) {
    return true;
  }

  const query = search.trim().toLowerCase();
  const haystack = [item.title, item.excerpt, item.bodyMarkdown, item.slug]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function listFilteredMockContent(filters: ContentFilters = {}) {
  return getMockContents()
    .filter((item) => (filters.section ? item.section === filters.section : true))
    .filter((item) => (filters.status ? item.status === filters.status : true))
    .filter((item) => (filters.category ? item.category?.slug === filters.category : true))
    .filter((item) =>
      filters.tag ? item.tags.some((tag) => tag.slug === filters.tag) : true
    )
    .filter((item) => matchSearch(item, filters.search))
    .sort((a, b) => (b.publishedAt || b.updatedAt || "").localeCompare(a.publishedAt || a.updatedAt || ""));
}

async function getCacheJson<T>(
  cache: KVNamespace | undefined,
  key: string,
  loader: () => Promise<T>,
  ttl = 300
) {
  if (!cache) {
    return loader();
  }

  const hit = await cache.get(key, "json");
  if (hit) {
    return hit as T;
  }

  const value = await loader();
  await cache.put(key, JSON.stringify(value), {
    expirationTtl: ttl
  });
  return value;
}

export async function invalidatePublicCache(env: ApiEnv["Bindings"]) {
  if (!env.CACHE) {
    return;
  }

  const keys = await env.CACHE.list({ prefix: "public:" });
  await Promise.all(
    keys.keys.map((key: { name: string }) => env.CACHE?.delete(key.name))
  );
}

export async function listNavigation(): Promise<NavigationItem[]> {
  return navigationItems;
}

export async function getSiteSettings(env: ApiEnv["Bindings"]): Promise<SiteSettings> {
  const settings = env.CACHE
    ? (await env.CACHE.get("site:settings", "json")) as SiteSettings | null
    : null;
  const resolved = settings || getMockSettings();
  return resolved.siteUrl === "https://example.com" && env.SITE_URL
    ? { ...resolved, siteUrl: env.SITE_URL }
    : resolved;
}

export async function updateSiteSettings(
  env: ApiEnv["Bindings"],
  next: SiteSettings
): Promise<SiteSettings> {
  if (env.CACHE) {
    await env.CACHE.put("site:settings", JSON.stringify(next));
  } else {
    setMockSettings(next);
  }

  await invalidatePublicCache(env);
  return next;
}

export async function listCategories(env: ApiEnv["Bindings"], section?: string) {
  if (!(await canUseDatabase(env))) {
    return getMockCategories().filter((item) => (section ? item.section === section : true));
  }

  const baseQuery = section
    ? env.DB!.prepare(
        "SELECT id, name, slug, section, description, accent FROM categories WHERE section = ? ORDER BY name ASC"
      ).bind(section)
    : env.DB!.prepare(
        "SELECT id, name, slug, section, description, accent FROM categories ORDER BY section ASC, name ASC"
      );

  const result = await baseQuery.all<Record<string, unknown>>();
  return (result.results || []) as unknown as Category[];
}

export async function listTags(env: ApiEnv["Bindings"]) {
  if (!(await canUseDatabase(env))) {
    return getMockTags();
  }

  const result = await env.DB!.prepare(
    "SELECT id, name, slug FROM tags ORDER BY name ASC"
  ).all<Record<string, unknown>>();

  return (result.results || []) as unknown as Tag[];
}

function attachRelations(
  item: Omit<ContentDetail, "category" | "tags"> & {
    categorySlug?: string;
    tagSlugs?: string[];
  },
  categories: Category[],
  tags: Tag[]
): ContentDetail {
  return hydrateBody({
    ...item,
    category: categories.find((category) => category.slug === item.categorySlug),
    tags: tags.filter((tag) => item.tagSlugs?.includes(tag.slug))
  });
}

function mapContentRow(
  row: Record<string, unknown>,
  categories: Category[],
  tags: Tag[]
): ContentDetail {
  const tagSlugs = parseJson<string[]>(row.tags_json, []);
  const seo = parseJson(row.seo_json, {
    title: String(row.title || ""),
    description: String(row.excerpt || "")
  });
  const video = parseJson(row.video_json, undefined);
  const metrics = parseJson(row.metrics_json, undefined);

  return attachRelations(
    {
      id: String(row.id),
      section: String(row.section) as ContentDetail["section"],
      status: String(row.status) as ContentDetail["status"],
      slug: String(row.slug),
      title: String(row.title),
      excerpt: String(row.excerpt),
      coverImage: row.cover_image ? String(row.cover_image) : undefined,
      coverAlt: row.cover_alt ? String(row.cover_alt) : undefined,
      bodyMarkdown: String(row.body_markdown || ""),
      categorySlug: row.category_slug ? String(row.category_slug) : undefined,
      tagSlugs,
      seo,
      video,
      metrics,
      featured: toBoolean(row.featured),
      readingTime: row.reading_time ? Number(row.reading_time) : undefined,
      publishedAt: row.published_at ? String(row.published_at) : undefined,
      updatedAt: row.updated_at ? String(row.updated_at) : undefined
    },
    categories,
    tags
  );
}

export async function listContents(
  env: ApiEnv["Bindings"],
  filters: ContentFilters = {}
): Promise<ContentItem[]> {
  const cacheKey = `public:list:${JSON.stringify(filters)}`;

  return getCacheJson(env.CACHE, cacheKey, async () => {
    if (!(await canUseDatabase(env))) {
      return listFilteredMockContent(filters).slice(0, filters.limit || 50);
    }

    const categories = await listCategories(env);
    const tags = await listTags(env);

    const clauses: string[] = [];
    const bindings: unknown[] = [];

    if (filters.section) {
      clauses.push("section = ?");
      bindings.push(filters.section);
    }
    if (filters.status) {
      clauses.push("status = ?");
      bindings.push(filters.status);
    }
    if (filters.category) {
      clauses.push("category_slug = ?");
      bindings.push(filters.category);
    }
    if (filters.tag) {
      clauses.push("tags_json LIKE ?");
      bindings.push(`%\"${filters.tag}\"%`);
    }
    if (filters.search) {
      clauses.push("(title LIKE ? OR excerpt LIKE ? OR body_markdown LIKE ?)");
      bindings.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const sql = `SELECT * FROM contents ${whereSql} ORDER BY COALESCE(published_at, updated_at) DESC LIMIT ?`;
    bindings.push(filters.limit || 50);

    const result = await env.DB!.prepare(sql).bind(...bindings).all<Record<string, unknown>>();
    return (result.results || []).map((row: Record<string, unknown>) =>
      mapContentRow(row, categories, tags)
    );
  });
}

export async function getContentBySlug(
  env: ApiEnv["Bindings"],
  slug: string,
  includeDraft = false
) {
  const cacheKey = includeDraft ? `draft:${slug}` : `public:detail:${slug}`;

  return getCacheJson(env.CACHE, cacheKey, async () => {
    if (!(await canUseDatabase(env))) {
      const item = getSharedContentBySlug(slug);
      if (!item) {
        return null;
      }
      if (!includeDraft && item.status !== "published") {
        return null;
      }
      return hydrateBody(item);
    }

    const categories = await listCategories(env);
    const tags = await listTags(env);
    const query = includeDraft
      ? env.DB!.prepare("SELECT * FROM contents WHERE slug = ? LIMIT 1").bind(slug)
      : env.DB!.prepare(
          "SELECT * FROM contents WHERE slug = ? AND status = 'published' LIMIT 1"
        ).bind(slug);

    const result = await query.first<Record<string, unknown>>();
    if (!result) {
      return null;
    }

    return mapContentRow(result, categories, tags);
  });
}

export async function getContentById(env: ApiEnv["Bindings"], id: string) {
  if (!(await canUseDatabase(env))) {
    return getMockContents().find((item) => item.id === id) || null;
  }

  const categories = await listCategories(env);
  const tags = await listTags(env);
  const result = await env.DB!.prepare("SELECT * FROM contents WHERE id = ? LIMIT 1")
    .bind(id)
    .first<Record<string, unknown>>();

  return result ? mapContentRow(result, categories, tags) : null;
}

export async function getHomePayload(env: ApiEnv["Bindings"]): Promise<HomePayload> {
  return getCacheJson(env.CACHE, "public:home", async () => {
    if (!(await canUseDatabase(env))) {
      return homePayload;
    }

    const latest = await listContents(env, { status: "published", limit: 8 });
    return {
      ...homePayload,
      latest,
      featured: latest.filter((item) => item.featured).slice(0, 3)
    };
  });
}

export async function getArchive(env: ApiEnv["Bindings"]): Promise<ArchiveEntry[]> {
  return getCacheJson(env.CACHE, "public:archive", async () => {
    if (!(await canUseDatabase(env))) {
      return archiveEntries;
    }

    const result = await env.DB!.prepare(
      `SELECT substr(COALESCE(published_at, updated_at), 1, 7) AS month,
              COUNT(*) AS count,
              MAX(title) AS latest_title
       FROM contents
       WHERE status = 'published'
       GROUP BY month
       ORDER BY month DESC`
    ).all<Record<string, unknown>>();

    return (result.results || []).map((row: Record<string, unknown>) => ({
      month: String(row.month),
      count: Number(row.count),
      latestTitle: String(row.latest_title)
    }));
  });
}

export async function getDashboardStats(env: ApiEnv["Bindings"]): Promise<DashboardStats> {
  if (!(await canUseDatabase(env))) {
    return getMockStats();
  }

  const [published, draft, featured, tagCount] = await Promise.all([
    env.DB!.prepare("SELECT COUNT(*) AS total FROM contents WHERE status = 'published'")
      .first<{ total: number }>(),
    env.DB!.prepare("SELECT COUNT(*) AS total FROM contents WHERE status = 'draft'")
      .first<{ total: number }>(),
    env.DB!.prepare("SELECT COUNT(*) AS total FROM contents WHERE featured = 1")
      .first<{ total: number }>(),
    env.DB!.prepare("SELECT COUNT(*) AS total FROM tags").first<{ total: number }>()
  ]);

  return {
    publishedCount: Number(published?.total || 0),
    draftCount: Number(draft?.total || 0),
    featuredCount: Number(featured?.total || 0),
    tagCount: Number(tagCount?.total || 0)
  };
}

export async function upsertCategory(
  env: ApiEnv["Bindings"],
  input: CategoryMutationInput
): Promise<Category> {
  const now = new Date().toISOString();
  const payload: Category = {
    id: input.id || crypto.randomUUID(),
    name: input.name,
    slug: input.slug,
    section: input.section,
    description: input.description,
    accent: input.accent
  };

  if (!(await canUseDatabase(env))) {
    const next = getMockCategories().filter((item) => item.id !== payload.id && item.slug !== payload.slug);
    next.push(payload);
    setMockCategories(next);
    await invalidatePublicCache(env);
    return payload;
  }

  await env.DB!.prepare(
    `INSERT INTO categories (id, name, slug, section, description, accent, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       slug = excluded.slug,
       section = excluded.section,
       description = excluded.description,
       accent = excluded.accent,
       updated_at = excluded.updated_at`
  )
    .bind(
      payload.id,
      payload.name,
      payload.slug,
      payload.section,
      payload.description || null,
      payload.accent || null,
      now,
      now
    )
    .run();

  await invalidatePublicCache(env);
  return payload;
}

export async function upsertTag(env: ApiEnv["Bindings"], input: TagMutationInput): Promise<Tag> {
  const now = new Date().toISOString();
  const payload: Tag = {
    id: input.id || crypto.randomUUID(),
    name: input.name,
    slug: input.slug
  };

  if (!(await canUseDatabase(env))) {
    const next = getMockTags().filter((item) => item.id !== payload.id && item.slug !== payload.slug);
    next.push(payload);
    setMockTags(next);
    await invalidatePublicCache(env);
    return payload;
  }

  await env.DB!.prepare(
    `INSERT INTO tags (id, name, slug, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       slug = excluded.slug,
       updated_at = excluded.updated_at`
  )
    .bind(payload.id, payload.name, payload.slug, now, now)
    .run();

  await invalidatePublicCache(env);
  return payload;
}

export async function upsertContent(
  env: ApiEnv["Bindings"],
  input: ContentMutationInput
): Promise<ContentDetail> {
  const now = new Date().toISOString();
  const categories = await listCategories(env);
  const tags = await listTags(env);

  const payload = attachRelations(
    {
      id: input.id || crypto.randomUUID(),
      section: input.section as ContentDetail["section"],
      status: input.status as ContentDetail["status"],
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      coverImage: input.coverImage,
      coverAlt: input.coverAlt,
      bodyMarkdown: input.bodyMarkdown,
      categorySlug: input.categorySlug,
      tagSlugs: input.tagSlugs || [],
      featured: Boolean(input.featured),
      readingTime: input.readingTime,
      publishedAt: input.publishedAt,
      updatedAt: now,
      seo: {
        title: input.seoTitle || input.title,
        description: input.seoDescription || input.excerpt,
        ogImage: input.ogImage || input.coverImage
      },
      video: input.videoPlatform
        ? {
            platform: input.videoPlatform as NonNullable<ContentDetail["video"]>["platform"],
            embedUrl: input.videoEmbedUrl,
            posterUrl: input.videoPosterUrl,
            durationSeconds: input.videoDurationSeconds
          }
        : undefined
    },
    categories,
    tags
  );

  if (!(await canUseDatabase(env))) {
    const next = getMockContents().filter((item) => item.id !== payload.id && item.slug !== payload.slug);
    next.push(payload);
    setMockContents(next);
    await invalidatePublicCache(env);
    return payload;
  }

  await env.DB!.prepare(
    `INSERT INTO contents (
      id, section, status, slug, title, excerpt, cover_image, cover_alt, body_markdown,
      category_slug, tags_json, seo_json, video_json, metrics_json, featured, reading_time,
      published_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      section = excluded.section,
      status = excluded.status,
      slug = excluded.slug,
      title = excluded.title,
      excerpt = excluded.excerpt,
      cover_image = excluded.cover_image,
      cover_alt = excluded.cover_alt,
      body_markdown = excluded.body_markdown,
      category_slug = excluded.category_slug,
      tags_json = excluded.tags_json,
      seo_json = excluded.seo_json,
      video_json = excluded.video_json,
      featured = excluded.featured,
      reading_time = excluded.reading_time,
      published_at = excluded.published_at,
      updated_at = excluded.updated_at`
  )
    .bind(
      payload.id,
      payload.section,
      payload.status,
      payload.slug,
      payload.title,
      payload.excerpt,
      payload.coverImage || null,
      payload.coverAlt || null,
      payload.bodyMarkdown,
      payload.category?.slug || null,
      JSON.stringify(payload.tags.map((tag) => tag.slug)),
      JSON.stringify(payload.seo),
      payload.video ? JSON.stringify(payload.video) : null,
      payload.metrics ? JSON.stringify(payload.metrics) : null,
      payload.featured ? 1 : 0,
      payload.readingTime || null,
      payload.publishedAt || null,
      now,
      now
    )
    .run();

  await invalidatePublicCache(env);
  return payload;
}

export async function deleteContent(env: ApiEnv["Bindings"], id: string) {
  if (!(await canUseDatabase(env))) {
    setMockContents(getMockContents().filter((item) => item.id !== id));
    await invalidatePublicCache(env);
    return true;
  }

  await env.DB!.prepare("DELETE FROM contents WHERE id = ?").bind(id).run();
  await invalidatePublicCache(env);
  return true;
}

export async function getSectionOverview(env: ApiEnv["Bindings"]) {
  const items = await listContents(env, {
    status: "published",
    limit: 200
  });
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.section] = (acc[item.section] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(sectionMeta).map(([section, meta]) => ({
    section,
    ...meta,
    count: counts[section] || 0
  }));
}
