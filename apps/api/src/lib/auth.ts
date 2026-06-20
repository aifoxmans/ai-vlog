import type { Context, MiddlewareHandler } from "hono";
import { getCookie, setCookie } from "hono/cookie";

export interface ApiEnv {
  Bindings: {
    DB?: D1Database;
    CACHE?: KVNamespace;
    SESSIONS?: KVNamespace;
    ADMIN_USERNAME?: string;
    ADMIN_PASSWORD?: string;
  };
  Variables: {
    session: {
      username: string;
      createdAt?: string;
    };
  };
}

const FALLBACK_USERNAME = "admin";
const FALLBACK_PASSWORD = "admin123";
const FALLBACK_TOKEN = "mock-admin-token";

export function getConfiguredCredentials(c: Context<ApiEnv>) {
  return {
    username: c.env.ADMIN_USERNAME || FALLBACK_USERNAME,
    password: c.env.ADMIN_PASSWORD || FALLBACK_PASSWORD
  };
}

export async function createSession(c: Context<ApiEnv>, username: string) {
  const token = crypto.randomUUID();
  const payload = JSON.stringify({
    username,
    createdAt: new Date().toISOString()
  });

  if (c.env.SESSIONS) {
    await c.env.SESSIONS.put(`session:${token}`, payload, {
      expirationTtl: 60 * 60 * 24 * 7
    });
  }

  setCookie(c, "ai_vlog_session", token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: true
  });

  return token;
}

export async function destroySession(c: Context<ApiEnv>, token?: string) {
  const resolvedToken = token || getCookie(c, "ai_vlog_session");
  if (resolvedToken && c.env.SESSIONS) {
    await c.env.SESSIONS.delete(`session:${resolvedToken}`);
  }
  setCookie(c, "ai_vlog_session", "", {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 0,
    secure: true
  });
}

export async function resolveSession(c: Context<ApiEnv>) {
  const header = c.req.header("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const cookieToken = getCookie(c, "ai_vlog_session");
  const token = bearer || cookieToken;

  if (!token) {
    return null;
  }

  if (!c.env.SESSIONS) {
    return token === FALLBACK_TOKEN ? { username: FALLBACK_USERNAME } : null;
  }

  const session = await c.env.SESSIONS.get(`session:${token}`, "json");
  return session as ApiEnv["Variables"]["session"] | null;
}

export const requireAdmin: MiddlewareHandler<ApiEnv> = async (c, next) => {
  const session = await resolveSession(c);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("session", session);
  await next();
};

export function getFallbackToken() {
  return FALLBACK_TOKEN;
}
