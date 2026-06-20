import { getHomeData, getNavigationData } from "../lib/api";

export async function GET() {
  const [{ settings }, home] = await Promise.all([getNavigationData(), getHomeData()]);

  const items = home.latest
    .map(
      (item) => `
        <item>
          <title><![CDATA[${item.title}]]></title>
          <link>${new URL(`/posts/${item.slug}`, settings.siteUrl).toString()}</link>
          <guid>${new URL(`/posts/${item.slug}`, settings.siteUrl).toString()}</guid>
          <pubDate>${new Date(item.publishedAt || item.updatedAt || Date.now()).toUTCString()}</pubDate>
          <description><![CDATA[${item.excerpt}]]></description>
        </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title><![CDATA[${settings.siteName}]]></title>
      <link>${settings.siteUrl}</link>
      <description><![CDATA[${settings.siteDescription}]]></description>
      ${items}
    </channel>
  </rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8"
    }
  });
}

