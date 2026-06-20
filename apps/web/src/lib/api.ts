import type {
  ArchiveEntry,
  Category,
  ContentDetail,
  ContentItem,
  HomePayload,
  NavigationItem,
  PublicSection,
  SiteSettings,
  Tag
} from "@ai-vlog/shared";

export interface SectionOverview {
  section: PublicSection;
  label: string;
  href: string;
  summary: string;
  count: number;
}

const API_BASE = import.meta.env.PUBLIC_API_BASE_URL || "http://127.0.0.1:8787";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(new URL(path, API_BASE), {
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getNavigationData() {
  return fetchJson<{ navigation: NavigationItem[]; settings: SiteSettings }>("/api/public/navigation");
}

export async function getHomeData() {
  return fetchJson<HomePayload & { settings: SiteSettings }>("/api/public/home");
}

export async function getSectionItems(section: PublicSection) {
  return fetchJson<{ items: ContentItem[]; total: number }>(`/api/public/content?section=${section}`);
}

export async function getContent(slug: string) {
  return fetchJson<ContentDetail>(`/api/public/content/${slug}`);
}

export async function getTags() {
  return fetchJson<Tag[]>("/api/public/tags");
}

export async function getTagItems(slug: string) {
  return fetchJson<{ slug: string; items: ContentItem[]; total: number }>(`/api/public/tags/${slug}`);
}

export async function getCategories(section?: PublicSection) {
  const query = section ? `?section=${section}` : "";
  return fetchJson<Category[]>(`/api/public/categories${query}`);
}

export async function getCategoryItems(slug: string) {
  return fetchJson<{ slug: string; items: ContentItem[]; total: number }>(
    `/api/public/categories/${slug}`
  );
}

export async function getArchiveItems() {
  return fetchJson<ArchiveEntry[]>("/api/public/archive");
}

export async function searchContent(query: string) {
  return fetchJson<{ query: string; items: ContentItem[]; total: number }>(
    `/api/public/search?q=${encodeURIComponent(query)}`
  );
}

export async function getSectionOverview() {
  return fetchJson<SectionOverview[]>("/api/public/sections");
}

export async function getSectionPageData(section: PublicSection) {
  const [nav, meta, listing, categories, tags] = await Promise.all([
    getNavigationData(),
    getSectionOverview().then((items) => items.find((item) => item.section === section)),
    getSectionItems(section),
    getCategories(section),
    getTags()
  ]);

  if (!meta) {
    throw new Error(`Unknown section: ${section}`);
  }

  return {
    ...nav,
    meta,
    items: listing.items,
    total: listing.total,
    categories,
    tags
  };
}
