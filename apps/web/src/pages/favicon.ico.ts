export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="9" fill="#006686"/>
  <path d="M8 22V10h3.1l9.8 7.5V10H24v12h-3.1l-9.8-7.5V22H8Z" fill="#ffffff"/>
</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=86400"
    }
  });
}
