import { navigation, sectionMeta } from "./constants";
import type {
  ArchiveEntry,
  Category,
  ContentDetail,
  ContentItem,
  DashboardStats,
  HomePayload,
  SiteSettings,
  Tag
} from "./types";

export const siteSettings: SiteSettings = {
  siteName: "Northstar Vlog System",
  siteUrl: "https://example.com",
  siteDescription:
    "一个面向个人博客、企业官网与中小型工具站的内容优先平台，强调 SEO、极致速度与 AI 可读性。",
  heroTitle: "记录 AI 之路，构建可复用的一人公司内容系统",
  heroSummary:
    "面向搜索引擎与大模型的结构化站点：完整 HTML、清晰语义、快速访问、低维护成本。",
  newsletterTitle: "订阅站点周报",
  newsletterSummary: "每周一次，整理增长、内容生产与 AI 工具链的有效实践。",
  adminBrand: "Northstar Console",
  socialLinks: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "RSS", href: "/rss.xml" },
    { label: "Sitemap", href: "/sitemap.xml" }
  ]
};

export const categories: Category[] = [
  {
    id: "cat-learn-llm",
    name: "LLM 工程",
    slug: "llm-engineering",
    section: "learn",
    description: "模型能力拆解、RAG 与推理链路设计。",
    accent: "var(--tone-signal)"
  },
  {
    id: "cat-venture-growth",
    name: "增长运营",
    slug: "growth-ops",
    section: "venture",
    description: "增长模型、转化设计与渠道实验。",
    accent: "var(--tone-copper)"
  },
  {
    id: "cat-showcase-video",
    name: "视频实验",
    slug: "video-lab",
    section: "showcase",
    description: "外链视频与创作过程沉淀。",
    accent: "var(--tone-aurora)"
  },
  {
    id: "cat-journal-reflect",
    name: "长期反思",
    slug: "long-reflection",
    section: "journal",
    description: "写给未来自己的校准笔记。",
    accent: "var(--tone-soft)"
  },
  {
    id: "cat-resources-stack",
    name: "效率工具",
    slug: "productivity-stack",
    section: "resources",
    description: "支撑写作、运营与自动化的核心工具。",
    accent: "var(--tone-signal)"
  }
];

export const tags: Tag[] = [
  { id: "tag-seo", name: "SEO", slug: "seo" },
  { id: "tag-gpt", name: "GPT", slug: "gpt" },
  { id: "tag-automation", name: "Automation", slug: "automation" },
  { id: "tag-cloudflare", name: "Cloudflare", slug: "cloudflare" },
  { id: "tag-workers", name: "Workers", slug: "workers" },
  { id: "tag-brand", name: "Brand", slug: "brand" },
  { id: "tag-journal", name: "Reflection", slug: "reflection" },
  { id: "tag-video", name: "Video", slug: "video" }
];

const detailContent: ContentDetail[] = [
  {
    id: "cnt-learn-hono-seo",
    section: "learn",
    status: "published",
    slug: "workers-hono-seo-pipeline",
    title: "用 Hono + Workers 构建可抓取的 SEO 内容管线",
    excerpt:
      "把页面性能、缓存策略、结构化数据和内容模型放进同一条交付链路，而不是分散地补丁式优化。",
    coverImage:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    coverAlt: "控制台与数据面板",
    publishedAt: "2026-04-23T00:00:00.000Z",
    updatedAt: "2026-04-23T00:00:00.000Z",
    featured: true,
    readingTime: 8,
    category: categories[0],
    tags: [tags[0], tags[3], tags[4]],
    seo: {
      title: "Hono + Workers SEO 内容管线",
      description: "以 Cloudflare Workers 为基础搭建轻量、可抓取、响应极快的内容站交付系统。 "
    },
    metrics: { views: 1280, likes: 93, comments: 12 },
    bodyMarkdown: `## 为什么把 SEO 和架构一起设计

如果公开站依赖客户端请求正文，搜索引擎和大模型都会遇到信息不完整的问题。最稳妥的做法，是在响应时直接输出语义完整的 HTML。

## 这条管线做了什么

- 内容实体统一建模
- 列表页、详情页、标签页全部可直出
- sitemap、RSS、JSON-LD 一并生成
- 首页和列表页通过 KV 缓存减轻 D1 查询压力

## 关键取舍

1. **前端静态优先，必要时服务端渲染。**
2. **媒体文件不放进 D1。**
3. **后台只做单管理员，降低权限系统复杂度。**

## 结果

用户得到的是快；搜索系统得到的是清晰；运维得到的是低成本。`
  },
  {
    id: "cnt-learn-structured-content",
    section: "learn",
    status: "published",
    slug: "structured-content-for-llm-crawlers",
    title: "让 GPT 和搜索引擎更容易读懂你的内容结构",
    excerpt:
      "好的页面不是堆关键词，而是让标题层级、摘要、标签、时间和正文结构彼此一致。",
    coverImage:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
    coverAlt: "文本结构草图",
    publishedAt: "2026-04-20T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
    readingTime: 6,
    category: categories[0],
    tags: [tags[0], tags[1]],
    seo: {
      title: "结构化内容设计指南",
      description: "用稳定的内容模型与语义化 HTML 提升可索引性与可引用性。"
    },
    metrics: { views: 910, likes: 67, comments: 5 },
    bodyMarkdown: `## 页面真正需要统一的，是结构

同一篇内容的标题、摘要、封面说明、标签和 canonical 必须表达同一件事。否则搜索系统会把它视为弱信号页面。

## 一个简单模板

- 一个清晰的主标题
- 一段可独立引用的摘要
- 可归档的发布时间
- 明确的标签与栏目
- 结构稳定的二级标题`
  },
  {
    id: "cnt-venture-growth",
    section: "venture",
    status: "published",
    slug: "solo-company-growth-loop",
    title: "一人公司如何把内容、产品和询盘串成增长闭环",
    excerpt:
      "站点不是展示册，而是增长装置。首页负责理解，栏目页负责筛选，详情页负责转化。",
    coverImage:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    coverAlt: "桌上的增长白板",
    publishedAt: "2026-04-19T00:00:00.000Z",
    updatedAt: "2026-04-19T00:00:00.000Z",
    featured: true,
    readingTime: 7,
    category: categories[1],
    tags: [tags[0], tags[5]],
    seo: {
      title: "一人公司内容增长闭环",
      description: "将内容站、官网与工具站整合进一个低成本增长系统。"
    },
    metrics: { views: 1560, likes: 101, comments: 17 },
    bodyMarkdown: `## 三个页面角色

- 首页：讲清楚你是谁、做什么、为什么值得看
- 栏目页：承接搜索流量并形成主题聚类
- 详情页：完成信任建立和行动转化

## 为什么轻量很重要

当站点是你一个人维护时，系统必须允许你稳定更新，而不是依赖频繁修修补补。`
  },
  {
    id: "cnt-venture-launch",
    section: "venture",
    status: "draft",
    slug: "launch-checklist-for-micro-sites",
    title: "小型内容站上线前清单：从元标签到缓存",
    excerpt: "把最容易遗漏的上线项整理成一张 checklist，避免上线即返工。",
    coverImage:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
    coverAlt: "发布清单便签",
    publishedAt: "2026-04-18T00:00:00.000Z",
    updatedAt: "2026-04-22T00:00:00.000Z",
    readingTime: 5,
    category: categories[1],
    tags: [tags[0], tags[3]],
    seo: {
      title: "小型站点上线前清单",
      description: "从页面元信息、路径规范、站点地图到缓存清理的最小闭环。"
    },
    bodyMarkdown: `## 发布前只做最关键的检查

不要试图一次做完所有功能。优先确保抓取、缓存、路径和内容可以稳定工作。`,
    metrics: { views: 0, likes: 0, comments: 0 }
  },
  {
    id: "cnt-showcase-vlog",
    section: "showcase",
    status: "published",
    slug: "building-an-ai-vlog-stack",
    title: "AI Vlog 工作流展示：从选题到发布的外链视频页面",
    excerpt:
      "媒体文件不进数据库，站点只负责把选题、摘要、封面、时长和行动入口组织成可抓取页面。",
    coverImage:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
    coverAlt: "视频制作工作台",
    publishedAt: "2026-04-17T00:00:00.000Z",
    updatedAt: "2026-04-17T00:00:00.000Z",
    featured: true,
    readingTime: 4,
    category: categories[2],
    tags: [tags[7], tags[2]],
    video: {
      platform: "youtube",
      videoId: "dQw4w9WgXcQ",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      posterUrl:
        "https://images.unsplash.com/photo-1516321310764-8d4c0b5d43f6?auto=format&fit=crop&w=1200&q=80",
      durationSeconds: 542
    },
    seo: {
      title: "AI Vlog 工作流展示",
      description: "以 YouTube 等外链平台承载视频，本地站点输出 SEO 友好的介绍、摘要与流程拆解。"
    },
    metrics: { views: 670, likes: 54, comments: 8 },
    bodyMarkdown: `## 外链视频也值得有详情页

视频平台负责分发，独立站负责讲清楚上下文、价值和可引用信息。

## 页面必须包含的字段

- 视频标题与一句话定位
- 关键看点
- 适合谁看
- 使用到的模型与工具
- 跳转或嵌入入口`
  },
  {
    id: "cnt-journal-focus",
    section: "journal",
    status: "published",
    slug: "focus-is-an-economic-asset",
    title: "专注力是一种经营资产，而不是自我感动",
    excerpt: "当内容、产品和客户都由一个人承担时，注意力预算就必须像现金流一样被管理。",
    coverImage:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    coverAlt: "安静的写作桌面",
    publishedAt: "2026-04-16T00:00:00.000Z",
    updatedAt: "2026-04-16T00:00:00.000Z",
    readingTime: 5,
    category: categories[3],
    tags: [tags[6]],
    seo: {
      title: "专注力是一种经营资产",
      description: "给一人公司的一条提醒：注意力不是感觉问题，而是资源分配问题。"
    },
    metrics: { views: 420, likes: 38, comments: 11 },
    bodyMarkdown: `## 专注不是气氛，是分配

今天没有再追求“看起来很忙”的效率，而是只盯住一条最直接影响业务结果的内容链路。

## 结论

如果某项工作不能在未来 30 天产生复利，它就不该挤占最好的注意力时段。`
  },
  {
    id: "cnt-resources-stack",
    section: "resources",
    status: "published",
    slug: "lean-stack-for-content-sites",
    title: "内容站轻量工具栈：Astro、Hono、D1、KV 的组合边界",
    excerpt:
      "工具选型不是追新，而是让维护成本、部署链路和站点速度长期可控。",
    coverImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    coverAlt: "开发工具组合",
    publishedAt: "2026-04-15T00:00:00.000Z",
    updatedAt: "2026-04-15T00:00:00.000Z",
    readingTime: 9,
    category: categories[4],
    tags: [tags[3], tags[4], tags[2]],
    seo: {
      title: "Astro + Hono + D1 + KV 选型指南",
      description: "轻量内容系统的实用边界：哪些放数据库，哪些交给 KV，哪些根本不该自己托管。"
    },
    metrics: { views: 1180, likes: 75, comments: 9 },
    bodyMarkdown: `## 这套组合适合什么

- 个人博客
- 企业官网
- 中小型工具站

## 不适合什么

- 复杂协同后台
- 高频交易类系统
- 大文件媒体托管

## 真正的优势

边缘部署快，成本低，架构层级少。`
  }
];

export const navigationItems = navigation;

export const homePayload: HomePayload = {
  featured: detailContent.filter((item) => item.featured && item.status === "published"),
  latest: detailContent
    .filter((item) => item.status === "published")
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || "")),
  sections: Object.entries(sectionMeta).map(([section, value]) => ({
    section: section as keyof typeof sectionMeta,
    title: value.label,
    summary: value.summary,
    href: value.href
  })),
  tags
};

export const archiveEntries: ArchiveEntry[] = [
  { month: "2026-04", count: 7, latestTitle: "用 Hono + Workers 构建可抓取的 SEO 内容管线" },
  { month: "2026-03", count: 4, latestTitle: "一人公司如何把内容、产品和询盘串成增长闭环" },
  { month: "2026-02", count: 3, latestTitle: "内容站轻量工具栈：Astro、Hono、D1、KV 的组合边界" }
];

export const dashboardStats: DashboardStats = {
  publishedCount: detailContent.filter((item) => item.status === "published").length,
  draftCount: detailContent.filter((item) => item.status === "draft").length,
  featuredCount: detailContent.filter((item) => item.featured).length,
  tagCount: tags.length
};

export function listPublishedContent(section?: string): ContentItem[] {
  return detailContent
    .filter((item) => item.status === "published")
    .filter((item) => (section ? item.section === section : true))
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
}

export function listAllContent(section?: string): ContentDetail[] {
  return detailContent
    .filter((item) => (section ? item.section === section : true))
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export function getContentBySlug(slug: string): ContentDetail | undefined {
  return detailContent.find((item) => item.slug === slug);
}

export function listContentByTag(slug: string): ContentItem[] {
  return listPublishedContent().filter((item) => item.tags.some((tag) => tag.slug === slug));
}

export function listContentByCategory(slug: string): ContentItem[] {
  return listPublishedContent().filter((item) => item.category?.slug === slug);
}

