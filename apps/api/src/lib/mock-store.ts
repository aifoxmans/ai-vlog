import {
  categories as sharedCategories,
  dashboardStats as sharedStats,
  listAllContent,
  siteSettings as sharedSettings,
  tags as sharedTags
} from "@ai-vlog/shared";
import type { Category, ContentDetail, DashboardStats, SiteSettings, Tag } from "@ai-vlog/shared";

let contents: ContentDetail[] = structuredClone(listAllContent());
let categories: Category[] = structuredClone(sharedCategories);
let tags: Tag[] = structuredClone(sharedTags);
let settings: SiteSettings = structuredClone(sharedSettings);

export function getMockContents() {
  return contents;
}

export function getMockCategories() {
  return categories;
}

export function getMockTags() {
  return tags;
}

export function getMockSettings() {
  return settings;
}

export function setMockContents(next: ContentDetail[]) {
  contents = next;
}

export function setMockCategories(next: Category[]) {
  categories = next;
}

export function setMockTags(next: Tag[]) {
  tags = next;
}

export function setMockSettings(next: SiteSettings) {
  settings = next;
}

export function getMockStats(): DashboardStats {
  return {
    ...sharedStats,
    publishedCount: contents.filter((item) => item.status === "published").length,
    draftCount: contents.filter((item) => item.status === "draft").length,
    featuredCount: contents.filter((item) => item.featured).length,
    tagCount: tags.length
  };
}

