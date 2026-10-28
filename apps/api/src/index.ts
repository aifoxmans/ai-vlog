import {
  type SiteSettings,
  sectionMeta
} from "@ai-vlog/shared";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import {
  createSession,
  destroySession,
  getConfiguredCredentials,
  getFallbackToken,
  requireAdmin,
  type ApiEnv
} from "./lib/auth";
import {
  deleteContent,
  getArchive,
  getContentById,
  getContentBySlug,
  getDashboardStats,
  getHomePayload,
  getSectionOverview,
  getSiteSettings,
  listCategories,
  listContents,
  listNavigation,
  listTags,
  updateSiteSettings,
  upsertCategory,
  upsertContent,
  upsertTag
} from "./lib/repository";
import { getCapabilityManifest, getOpenApiDocument } from "./lib/capability";

const app = new Hono<ApiEnv>();

app.use("*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

const contentSchema = z.object({
  id: z.string().optional(),
  section: z.enum(["learn", "venture", "showcase", "journal", "resources", "page"]),
  status: z.enum(["draft", "published"]),
  slug: z.string().min(2),
  title: z.string().min(2),
  excerpt: z.string().min(10),
  bodyMarkdown: z.string().min(10),
  categorySlug: z.string().optional(),
  tagSlugs: z.array(z.string()).default([]),
  coverImage: z.string().url().optional().or(z.literal("")),
  coverAlt: z.string().optional(),
  featured: z.boolean().optional(),
  readingTime: z.number().int().positive().optional(),
  publishedAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImage: z.string().url().optional().or(z.literal("")),
  videoPlatform: z.string().optional(),
  videoEmbedUrl: z.string().url().optional().or(z.literal("")),
  videoPosterUrl: z.string().url().optional().or(z.literal("")),
  videoDurationSeconds: z.number().int().optional()
});

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  section: z.enum(["learn", "venture", "showcase", "journal", "resources"]),
  description: z.string().optional(),
  accent: z.string().optional()
});

const tagSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1)
});

const settingsSchema: z.ZodType<SiteSettings> = z.object({
  siteName: z.string(),
  siteUrl: z.string().url(),
  siteDescription: z.string(),
  heroTitle: z.string(),
  heroSummary: z.string(),
  newsletterTitle: z.string(),
  newsletterSummary: z.string(),
  adminBrand: z.string(),
  socialLinks: z.array(
    z.object({
      label: z.string(),
      href: z.string()
    })
  )
});

app.get("/", (c) => c.json({
  name: "ai-vlog-api",
  status: "ok",
  sections: Object.keys(sectionMeta)
}));

app.get("/api/capabilities", (c) => {
  return c.json(getCapabilityManifest(new URL(c.req.url).origin));
});

app.get("/api/skill/manifest", (c) => {
  return c.json(getCapabilityManifest(new URL(c.req.url).origin));
});

app.get("/api/openapi.json", (c) => {
  return c.json(getOpenApiDocument(new URL(c.req.url).origin));
});

app.get("/api/public/navigation", async (c) => {
  const [navigation, settings] = await Promise.all([
    listNavigation(),
    getSiteSettings(c.env)
  ]);

  return c.json({ navigation, settings });
});

app.get("/api/public/home", async (c) => {
  const [payload, settings] = await Promise.all([
    getHomePayload(c.env),
    getSiteSettings(c.env)
  ]);

  return c.json({ ...payload, settings });
});

app.get("/api/public/sections", async (c) => {
  return c.json(await getSectionOverview(c.env));
});

app.get("/api/public/content", async (c) => {
  const section = c.req.query("section");
  const tag = c.req.query("tag");
  const category = c.req.query("category");
  const search = c.req.query("search");
  const limit = c.req.query("limit");
  const items = await listContents(c.env, {
    section: section || undefined,
    tag: tag || undefined,
    category: category || undefined,
    search: search || undefined,
    status: "published",
    limit: limit ? Number(limit) : 24
  });

  return c.json({
    items,
    total: items.length
  });
});

app.get("/api/public/content/:slug", async (c) => {
  const item = await getContentBySlug(c.env, c.req.param("slug"));
  if (!item) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.json(item);
});

app.get("/api/public/tags", async (c) => {
  return c.json(await listTags(c.env));
});

app.get("/api/public/tags/:slug", async (c) => {
  const items = await listContents(c.env, {
    tag: c.req.param("slug"),
    status: "published",
    limit: 100
  });
  return c.json({
    slug: c.req.param("slug"),
    items,
    total: items.length
  });
});

app.get("/api/public/categories", async (c) => {
  return c.json(await listCategories(c.env, c.req.query("section") || undefined));
});

app.get("/api/public/categories/:slug", async (c) => {
  const items = await listContents(c.env, {
    category: c.req.param("slug"),
    status: "published",
    limit: 100
  });
  return c.json({
    slug: c.req.param("slug"),
    items,
    total: items.length
  });
});

app.get("/api/public/archive", async (c) => {
  return c.json(await getArchive(c.env));
});

app.get("/api/public/search", async (c) => {
  const query = c.req.query("q") || "";
  const items = query
    ? await listContents(c.env, {
        search: query,
        status: "published",
        limit: 50
      })
    : [];
  return c.json({ query, items, total: items.length });
});

app.post("/api/admin/auth/login", zValidator("json", loginSchema), async (c) => {
  const body = c.req.valid("json");
  const { username, password } = getConfiguredCredentials(c);
  if (!password) {
    return c.json({ error: "Admin password is not configured" }, 503);
  }

  if (body.username !== username || body.password !== password) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await createSession(c, body.username);
  return c.json({
    token: c.env.SESSIONS ? token : getFallbackToken(),
    user: { username: body.username }
  });
});

app.post("/api/admin/auth/logout", requireAdmin, async (c) => {
  const header = c.req.header("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  await destroySession(c, bearer);
  return c.json({ ok: true });
});

app.get("/api/admin/dashboard", requireAdmin, async (c) => {
  const [stats, recent, settings] = await Promise.all([
    getDashboardStats(c.env),
    listContents(c.env, { limit: 5 }),
    getSiteSettings(c.env)
  ]);

  return c.json({ stats, recent, settings });
});

app.get("/api/admin/contents", requireAdmin, async (c) => {
  const items = await listContents(c.env, {
    section: c.req.query("section") || undefined,
    status: c.req.query("status") || undefined,
    search: c.req.query("search") || undefined,
    limit: 100
  });
  return c.json({ items, total: items.length });
});

app.get("/api/admin/contents/:id", requireAdmin, async (c) => {
  const item = await getContentById(c.env, c.req.param("id"));
  if (!item) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.json(item);
});

app.post("/api/admin/contents", requireAdmin, zValidator("json", contentSchema), async (c) => {
  return c.json(await upsertContent(c.env, c.req.valid("json")));
});

app.put(
  "/api/admin/contents/:id",
  requireAdmin,
  zValidator("json", contentSchema),
  async (c) => {
    const body = c.req.valid("json");
    return c.json(await upsertContent(c.env, { ...body, id: c.req.param("id") }));
  }
);

app.delete("/api/admin/contents/:id", requireAdmin, async (c) => {
  await deleteContent(c.env, c.req.param("id"));
  return c.json({ ok: true });
});

app.get("/api/admin/categories", requireAdmin, async (c) => {
  return c.json(await listCategories(c.env, c.req.query("section") || undefined));
});

app.post(
  "/api/admin/categories",
  requireAdmin,
  zValidator("json", categorySchema),
  async (c) => c.json(await upsertCategory(c.env, c.req.valid("json")))
);

app.get("/api/admin/tags", requireAdmin, async (c) => {
  return c.json(await listTags(c.env));
});

app.post("/api/admin/tags", requireAdmin, zValidator("json", tagSchema), async (c) => {
  return c.json(await upsertTag(c.env, c.req.valid("json")));
});

app.get("/api/admin/settings", requireAdmin, async (c) => {
  return c.json(await getSiteSettings(c.env));
});

app.put(
  "/api/admin/settings",
  requireAdmin,
  zValidator("json", settingsSchema),
  async (c) => c.json(await updateSiteSettings(c.env, c.req.valid("json")))
);

export default app;
