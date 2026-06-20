export type SiteSection =
  | "learn"
  | "venture"
  | "showcase"
  | "journal"
  | "resources"
  | "page";

export type PublicSection = Exclude<SiteSection, "page">;

export type ContentStatus = "draft" | "published";

export type VideoPlatform =
  | "youtube"
  | "bilibili"
  | "cloudflare-stream"
  | "loom"
  | "other";

export interface SeoMeta {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  noindex?: boolean;
}

export interface ExternalVideoMeta {
  platform: VideoPlatform;
  videoId?: string;
  embedUrl?: string;
  posterUrl?: string;
  durationSeconds?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  section: PublicSection;
  description?: string;
  accent?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  heroTitle: string;
  heroSummary: string;
  newsletterTitle: string;
  newsletterSummary: string;
  adminBrand: string;
  socialLinks: Array<{
    label: string;
    href: string;
  }>;
}

export interface ContentMetrics {
  views?: number;
  likes?: number;
  comments?: number;
}

export interface ContentItem {
  id: string;
  section: SiteSection;
  status: ContentStatus;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  coverAlt?: string;
  publishedAt?: string;
  updatedAt?: string;
  featured?: boolean;
  readingTime?: number;
  category?: Category;
  tags: Tag[];
  seo: SeoMeta;
  video?: ExternalVideoMeta;
  metrics?: ContentMetrics;
}

export interface ContentDetail extends ContentItem {
  bodyMarkdown: string;
  bodyHtml?: string;
  relatedSlugs?: string[];
}

export interface NavigationItem {
  label: string;
  href: string;
  section?: PublicSection;
}

export interface HomePayload {
  featured: ContentItem[];
  latest: ContentItem[];
  sections: Array<{
    section: PublicSection;
    title: string;
    summary: string;
    href: string;
  }>;
  tags: Tag[];
}

export interface ContentListResponse {
  items: ContentItem[];
  total: number;
}

export interface ArchiveEntry {
  month: string;
  count: number;
  latestTitle: string;
}

export interface DashboardStats {
  publishedCount: number;
  draftCount: number;
  featuredCount: number;
  tagCount: number;
}

