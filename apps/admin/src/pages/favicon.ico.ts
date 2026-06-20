export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="9" fill="#111827"/>
  <path d="M7 23 14.2 9h3.6L25 23h-3.7l-1.4-3H12l-1.4 3H7Zm6.3-6h5.4L16 11.2 13.3 17Z" fill="#ffffff"/>
</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=86400"
    }
  });
}
