import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

export interface DocReplica {
  title: string;
  lang: string;
  htmlClass?: string;
  bodyClass?: string;
  headHtml: string;
  bodyHtml: string;
}

const anchorMap: Record<string, string> = {
  "首页": "/",
  "学习": "/learn",
  "创业": "/venture",
  "创作": "/showcase",
  "日志": "/journal",
  "资源": "/resources",
  "Sign In": import.meta.env.PUBLIC_ADMIN_APP_URL || "http://localhost:4322/login"
};

const remoteImagePattern = /https:\/\/lh3\.googleusercontent\.com\/aida-public\/[^"]+/i;

function extractTitle(html: string, fallback: string) {
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  return titleMatch?.[1]?.trim() || fallback;
}

function mapAnchors(input: string) {
  return input.replace(/<a\b([^>]*?)href="#"([^>]*)>([\s\S]*?)<\/a>/gi, (full, before, after, inner) => {
    const plain = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const href = anchorMap[plain];
    if (!href) {
      return full;
    }

    return `<a${before}href="${href}"${after}>${inner}</a>`;
  });
}

function buildInlinePlaceholder(label: string) {
  const safeLabel = (label
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 72) || "AI Vlog")
    .replace(/[<&>"]/g, "");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${safeLabel}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#334155" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)" />
      <circle cx="960" cy="160" r="220" fill="rgba(255,255,255,0.08)" />
      <circle cx="220" cy="620" r="280" fill="rgba(255,255,255,0.05)" />
      <text x="72" y="640" fill="#f8fafc" font-size="54" font-family="Arial, sans-serif">${safeLabel}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function replaceProblematicImages(input: string) {
  return input.replace(/<img\b([^>]*?)src="([^"]+)"([^>]*)>/gi, (full, before, src, after) => {
    if (!remoteImagePattern.test(src)) {
      return full;
    }

    const label = full.match(/\bdata-alt="([^"]*)"/i)?.[1]
      || full.match(/\balt="([^"]*)"/i)?.[1]
      || "AI Vlog";

    return `<img${before}src="${buildInlinePlaceholder(label)}"${after}>`;
  });
}

function sanitizeHead(headHtml: string, title: string) {
  let result = headHtml
    .replace(/<meta[^>]+charset[^>]*>\s*/gi, "")
    .replace(/<meta[^>]+name="viewport"[^>]*>\s*/gi, "")
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, "");

  result = `<meta charset="utf-8"/>\n<meta name="viewport" content="width=device-width, initial-scale=1.0"/>\n<title>${title}</title>\n${result}`;
  return result;
}

export async function loadDocReplica(docFile: string, fallbackTitle: string): Promise<DocReplica> {
  const candidates = [
    path.resolve(process.cwd(), "docs", docFile),
    path.resolve(process.cwd(), "..", "..", "docs", docFile),
    path.resolve(process.cwd(), "..", "docs", docFile)
  ];

  const docPath = candidates.find((candidate) => existsSync(candidate));
  if (!docPath) {
    throw new Error(`Doc replica file not found: ${docFile}`);
  }

  const source = await readFile(docPath, "utf8");
  const htmlTag = source.match(/<html([^>]*)>/i)?.[1] || "";
  const bodyTag = source.match(/<body([^>]*)>/i)?.[1] || "";
  const headInner = source.match(/<head>([\s\S]*?)<\/head>/i)?.[1] || "";
  const bodyInner = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || "";
  const commentTitle = source.match(/<!--\s*(.*?)\s*-->/)?.[1]?.trim() || fallbackTitle;
  const title = extractTitle(source, commentTitle);
  const lang = htmlTag.match(/lang="([^"]+)"/i)?.[1] || "zh-CN";
  const htmlClass = htmlTag.match(/class="([^"]+)"/i)?.[1];
  const bodyClass = bodyTag.match(/class="([^"]+)"/i)?.[1];

  return {
    title,
    lang,
    htmlClass,
    bodyClass,
    headHtml: sanitizeHead(headInner, title),
    bodyHtml: replaceProblematicImages(mapAnchors(bodyInner))
  };
}
