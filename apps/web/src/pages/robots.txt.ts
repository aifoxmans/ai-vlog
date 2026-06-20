import { getNavigationData } from "../lib/api";

export async function GET() {
  const { settings } = await getNavigationData();
  const text = `User-agent: *\nAllow: /\nSitemap: ${new URL("/sitemap.xml", settings.siteUrl).toString()}\n`;

  return new Response(text, {
    headers: {
      "content-type": "text/plain; charset=utf-8"
    }
  });
}
