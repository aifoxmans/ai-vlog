const apiBase = import.meta.env.PUBLIC_API_BASE_URL || "http://127.0.0.1:8787";
export const tokenKey = "ai-vlog-admin-token";

export function getToken() {
  return globalThis.localStorage?.getItem(tokenKey) || "";
}

export async function apiRequest(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(new URL(path, apiBase), {
    ...init,
    headers
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || "Request failed");
  }

  return response.json();
}

export function redirectIfMissingToken() {
  if (!getToken()) {
    window.location.href = "/login";
  }
}

