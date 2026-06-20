import type { NavigationItem, PublicSection } from "./types";

export const sectionMeta: Record<
  PublicSection,
  { label: string; href: string; summary: string }
> = {
  learn: {
    label: "AI 学习",
    href: "/learn",
    summary: "教程总结、技术拆解与认知演进。"
  },
  venture: {
    label: "创业进展",
    href: "/venture",
    summary: "一人公司增长实验、产品迭代与商业判断。"
  },
  showcase: {
    label: "AI 作品",
    href: "/showcase",
    summary: "项目、视频、自动化流程与创作实验。"
  },
  journal: {
    label: "个人日志",
    href: "/journal",
    summary: "日常记录、长期反思与自我校准。"
  },
  resources: {
    label: "工具资源",
    href: "/resources",
    summary: "高频使用的工具栈、学习材料与方法库。"
  }
};

export const navigation: NavigationItem[] = [
  { label: "首页", href: "/" },
  { label: sectionMeta.learn.label, href: sectionMeta.learn.href, section: "learn" },
  { label: sectionMeta.venture.label, href: sectionMeta.venture.href, section: "venture" },
  {
    label: sectionMeta.showcase.label,
    href: sectionMeta.showcase.href,
    section: "showcase"
  },
  { label: sectionMeta.journal.label, href: sectionMeta.journal.href, section: "journal" },
  {
    label: sectionMeta.resources.label,
    href: sectionMeta.resources.href,
    section: "resources"
  },
  { label: "归档", href: "/archive" }
];

