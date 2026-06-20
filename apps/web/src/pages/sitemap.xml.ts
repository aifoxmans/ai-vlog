import { getArchiveItems, getHomeData, getNavigationData, getSectionOverview } from "../lib/api";

export async function GET() {
  const [{ settings }, home, sections] = await Promise.all([
    getNavigationData(),
    getHomeData(),
    getSectionOverview(),
    getArchiveItems()
  ]);

  const staticUrls = ["/", "/archive", "/search", ...sections.map((section) => section.href)];
  const contentUrls = home.latest.map((item) => `/posts/${item.slug}`);
  const tagUrls = home.tags.map((tag) => `/tags/${tag.slug}`);

  const urls = [...new Set([...staticUrls, ...contentUrls, ...tagUrls])];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map((path) => `<url><loc>${new URL(path, settings.siteUrl).toString()}</loc></url>`)
      .join("")}
  </urlset>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8"
    }
  });
}

