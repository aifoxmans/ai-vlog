#!/usr/bin/env node

const baseUrl = (process.argv[2] || process.env.AI_VLOG_API_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");

const checks = [
  { path: "/", expect: 200 },
  { path: "/api/capabilities", expect: 200 },
  { path: "/api/skill/manifest", expect: 200 },
  { path: "/api/openapi.json", expect: 200 },
  { path: "/api/public/navigation", expect: 200 },
  { path: "/api/public/home", expect: 200 },
  { path: "/api/public/sections", expect: 200 },
  { path: "/api/public/content?limit=3", expect: 200 },
  { path: "/api/public/archive", expect: 200 }
];

let failed = false;

for (const check of checks) {
  const url = `${baseUrl}${check.path}`;
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" }
    });
    const ok = response.status === check.expect;
    const body = await response.text();
    const bytes = Buffer.byteLength(body);
    console.log(`${ok ? "OK" : "FAIL"} ${response.status} ${check.path} ${bytes}b`);
    if (!ok) {
      failed = true;
    }
  } catch (error) {
    failed = true;
    console.log(`FAIL ${check.path} ${(error && error.message) || error}`);
  }
}

if (failed) {
  process.exitCode = 1;
}
