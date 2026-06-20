import type { ContentItem, PublicSection } from "@ai-vlog/shared";
import { formatNumber } from "./format";

export const sectionVisuals: Record<
  PublicSection,
  {
    icon: string;
    accent: string;
    soft: string;
    badge: string;
    action: string;
  }
> = {
  learn: {
    icon: "school",
    accent: "text-primary",
    soft: "bg-primary-fixed text-on-primary-fixed",
    badge: "bg-primary-fixed text-on-primary-fixed-variant",
    action: "探索知识库"
  },
  venture: {
    icon: "rocket_launch",
    accent: "text-tertiary",
    soft: "bg-tertiary-fixed text-on-tertiary-fixed",
    badge: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    action: "查看进展"
  },
  showcase: {
    icon: "design_services",
    accent: "text-secondary",
    soft: "bg-secondary-fixed text-on-secondary-fixed",
    badge: "bg-secondary-fixed text-on-secondary-fixed-variant",
    action: "查看作品"
  },
  journal: {
    icon: "auto_stories",
    accent: "text-secondary",
    soft: "bg-surface-container text-on-surface",
    badge: "bg-surface-container text-on-surface-variant",
    action: "阅读日志"
  },
  resources: {
    icon: "hub",
    accent: "text-primary",
    soft: "bg-primary-fixed text-on-primary-fixed",
    badge: "bg-primary-fixed text-on-primary-fixed-variant",
    action: "进入资源库"
  }
};

export function formatDateDot(input?: string) {
  if (!input) {
    return "未发布";
  }

  const date = new Date(input);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export function formatMonthLabel(input?: string) {
  if (!input) {
    return "近期";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long"
  }).format(new Date(input));
}

export function itemHref(item: ContentItem) {
  return `/posts/${item.slug}`;
}

export function itemImage(item?: ContentItem, label?: string) {
  if (item?.coverImage) {
    return item.coverImage;
  }

  const safe = encodeURIComponent(label || item?.title || "AI Vlog");
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0f172a"/><stop offset="1" stop-color="#334155"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="900" cy="180" r="200" fill="rgba(255,255,255,0.08)"/><circle cx="220" cy="620" r="280" fill="rgba(255,255,255,0.05)"/><text x="72" y="640" fill="#f8fafc" font-size="56" font-family="Arial, sans-serif">${safe}</text></svg>`
  )}`;
}

export function metricLabel(item?: ContentItem) {
  if (!item?.metrics) {
    return "新近发布";
  }

  if (item.metrics.views) {
    return `${formatNumber(item.metrics.views)} 阅读`;
  }

  if (item.metrics.likes) {
    return `${formatNumber(item.metrics.likes)} 喜欢`;
  }

  if (item.metrics.comments) {
    return `${formatNumber(item.metrics.comments)} 评论`;
  }

  return "已发布";
}

export function itemHighlights(item?: ContentItem) {
  if (!item) {
    return [];
  }

  const values = [
    item.category?.name,
    item.tags[0]?.name,
    item.readingTime ? `${item.readingTime} Min Read` : undefined,
    metricLabel(item)
  ];

  return values.filter(Boolean).slice(0, 3) as string[];
}

export function splitParagraphs(text: string, count = 3) {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^#+\s*/, "").replace(/^-+\s*/, "").trim())
    .filter(Boolean)
    .slice(0, count);
}
