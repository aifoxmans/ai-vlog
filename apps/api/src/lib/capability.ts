const publicEndpoints = [
  {
    method: "GET",
    path: "/",
    summary: "API health and section summary"
  },
  {
    method: "GET",
    path: "/api/capabilities",
    summary: "Machine-readable capability manifest"
  },
  {
    method: "GET",
    path: "/api/openapi.json",
    summary: "OpenAPI 3.1 contract"
  },
  {
    method: "GET",
    path: "/api/public/navigation",
    summary: "Public navigation and site settings"
  },
  {
    method: "GET",
    path: "/api/public/home",
    summary: "Home page payload"
  },
  {
    method: "GET",
    path: "/api/public/sections",
    summary: "Public section overview"
  },
  {
    method: "GET",
    path: "/api/public/content",
    summary: "Published content list with section, tag, category, search and limit filters"
  },
  {
    method: "GET",
    path: "/api/public/content/{slug}",
    summary: "Published content detail by slug"
  },
  {
    method: "GET",
    path: "/api/public/tags",
    summary: "Public tags"
  },
  {
    method: "GET",
    path: "/api/public/categories",
    summary: "Public categories"
  },
  {
    method: "GET",
    path: "/api/public/archive",
    summary: "Monthly archive"
  },
  {
    method: "GET",
    path: "/api/public/search",
    summary: "Published content search"
  }
];

const adminEndpoints = [
  {
    method: "POST",
    path: "/api/admin/auth/login",
    summary: "Create an admin bearer token"
  },
  {
    method: "POST",
    path: "/api/admin/auth/logout",
    summary: "Destroy the current admin token"
  },
  {
    method: "GET",
    path: "/api/admin/dashboard",
    summary: "Dashboard stats and recent content"
  },
  {
    method: "GET",
    path: "/api/admin/contents",
    summary: "Admin content list"
  },
  {
    method: "GET",
    path: "/api/admin/contents/{id}",
    summary: "Admin content detail by id"
  },
  {
    method: "POST",
    path: "/api/admin/contents",
    summary: "Create content"
  },
  {
    method: "PUT",
    path: "/api/admin/contents/{id}",
    summary: "Update content"
  },
  {
    method: "DELETE",
    path: "/api/admin/contents/{id}",
    summary: "Delete content"
  },
  {
    method: "GET",
    path: "/api/admin/categories",
    summary: "Admin category list"
  },
  {
    method: "POST",
    path: "/api/admin/categories",
    summary: "Create or update a category"
  },
  {
    method: "GET",
    path: "/api/admin/tags",
    summary: "Admin tag list"
  },
  {
    method: "POST",
    path: "/api/admin/tags",
    summary: "Create or update a tag"
  },
  {
    method: "GET",
    path: "/api/admin/settings",
    summary: "Admin site settings"
  },
  {
    method: "PUT",
    path: "/api/admin/settings",
    summary: "Update site settings"
  }
];

export function getCapabilityManifest(baseUrl: string) {
  return {
    schemaVersion: "2026-04-24",
    name: "ai-vlog-publisher",
    displayName: "AI Vlog Publisher",
    version: "0.1.0",
    description:
      "A publish-ready AI vlog content platform exposing public content APIs, admin content APIs, and a Codex Skill package for agent-driven publishing workflows.",
    baseUrl,
    skill: {
      name: "ai-vlog-publisher",
      packagePath: "skills/ai-vlog-publisher",
      entrypoint: "skills/ai-vlog-publisher/SKILL.md",
      defaultPrompt:
        "Use $ai-vlog-publisher to prepare, verify, and publish AI vlog content and API integrations."
    },
    auth: {
      public: "none",
      admin: {
        type: "bearer",
        loginEndpoint: "/api/admin/auth/login",
        defaultLocalCredentials: {
          username: "admin",
          password: "admin123"
        }
      }
    },
    capabilities: [
      "discover-site-content",
      "list-filter-search-content",
      "read-content-detail",
      "read-navigation-settings",
      "admin-content-crud",
      "admin-taxonomy-crud",
      "admin-settings-update"
    ],
    endpoints: {
      public: publicEndpoints,
      admin: adminEndpoints
    },
    publication: {
      openapiJson: `${baseUrl}/api/openapi.json`,
      openapiYaml: "docs/api/openapi.yaml",
      docs: "docs/PUBLISHING.md"
    }
  };
}

export function getOpenApiDocument(baseUrl: string) {
  const json = { type: "object", additionalProperties: true };
  const contentList = {
    type: "object",
    required: ["items", "total"],
    properties: {
      items: { type: "array", items: json },
      total: { type: "integer" }
    }
  };
  const bearerSecurity = [{ bearerAuth: [] }];

  return {
    openapi: "3.1.0",
    info: {
      title: "AI Vlog API",
      version: "0.1.0",
      description: "Public and admin API for the AI Vlog publishing platform."
    },
    servers: [{ url: baseUrl }],
    tags: [
      { name: "Capability" },
      { name: "Public" },
      { name: "Admin" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer"
        }
      },
      schemas: {
        JsonObject: json,
        ContentListResponse: contentList,
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string" }
          }
        },
        LoginRequest: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" }
          }
        },
        LoginResponse: {
          type: "object",
          required: ["token", "user"],
          properties: {
            token: { type: "string" },
            user: {
              type: "object",
              properties: {
                username: { type: "string" }
              }
            }
          }
        }
      }
    },
    paths: {
      "/": {
        get: {
          tags: ["Public"],
          summary: "API health",
          responses: { "200": { description: "API metadata" } }
        }
      },
      "/api/capabilities": {
        get: {
          tags: ["Capability"],
          summary: "Capability manifest",
          responses: { "200": { description: "Capability manifest" } }
        }
      },
      "/api/skill/manifest": {
        get: {
          tags: ["Capability"],
          summary: "Skill manifest alias",
          responses: { "200": { description: "Capability manifest" } }
        }
      },
      "/api/openapi.json": {
        get: {
          tags: ["Capability"],
          summary: "OpenAPI JSON contract",
          responses: { "200": { description: "OpenAPI document" } }
        }
      },
      "/api/public/navigation": {
        get: {
          tags: ["Public"],
          summary: "Navigation and settings",
          responses: { "200": { description: "Navigation payload" } }
        }
      },
      "/api/public/home": {
        get: {
          tags: ["Public"],
          summary: "Home payload",
          responses: { "200": { description: "Home payload" } }
        }
      },
      "/api/public/sections": {
        get: {
          tags: ["Public"],
          summary: "Section overview",
          responses: { "200": { description: "Section overview" } }
        }
      },
      "/api/public/content": {
        get: {
          tags: ["Public"],
          summary: "Published content list",
          parameters: [
            { name: "section", in: "query", schema: { type: "string" } },
            { name: "tag", in: "query", schema: { type: "string" } },
            { name: "category", in: "query", schema: { type: "string" } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1 } }
          ],
          responses: {
            "200": {
              description: "Content list",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ContentListResponse" } } }
            }
          }
        }
      },
      "/api/public/content/{slug}": {
        get: {
          tags: ["Public"],
          summary: "Content detail by slug",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Content detail" },
            "404": { description: "Not found" }
          }
        }
      },
      "/api/public/tags": {
        get: {
          tags: ["Public"],
          summary: "Tag list",
          responses: { "200": { description: "Tags" } }
        }
      },
      "/api/public/tags/{slug}": {
        get: {
          tags: ["Public"],
          summary: "Content by tag",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Tagged content list" } }
        }
      },
      "/api/public/categories": {
        get: {
          tags: ["Public"],
          summary: "Category list",
          parameters: [{ name: "section", in: "query", schema: { type: "string" } }],
          responses: { "200": { description: "Categories" } }
        }
      },
      "/api/public/categories/{slug}": {
        get: {
          tags: ["Public"],
          summary: "Content by category",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Category content list" } }
        }
      },
      "/api/public/archive": {
        get: {
          tags: ["Public"],
          summary: "Monthly archive",
          responses: { "200": { description: "Archive entries" } }
        }
      },
      "/api/public/search": {
        get: {
          tags: ["Public"],
          summary: "Search content",
          parameters: [{ name: "q", in: "query", schema: { type: "string" } }],
          responses: { "200": { description: "Search results" } }
        }
      },
      "/api/admin/auth/login": {
        post: {
          tags: ["Admin"],
          summary: "Admin login",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } }
          },
          responses: {
            "200": {
              description: "Bearer token",
              content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } }
            },
            "401": { description: "Invalid credentials" }
          }
        }
      },
      "/api/admin/auth/logout": {
        post: {
          tags: ["Admin"],
          security: bearerSecurity,
          summary: "Admin logout",
          responses: { "200": { description: "Logout result" } }
        }
      },
      "/api/admin/dashboard": {
        get: {
          tags: ["Admin"],
          security: bearerSecurity,
          summary: "Dashboard payload",
          responses: { "200": { description: "Dashboard stats" } }
        }
      },
      "/api/admin/contents": {
        get: {
          tags: ["Admin"],
          security: bearerSecurity,
          summary: "Admin content list",
          responses: { "200": { description: "Content list" } }
        },
        post: {
          tags: ["Admin"],
          security: bearerSecurity,
          summary: "Create content",
          responses: { "200": { description: "Created content" } }
        }
      },
      "/api/admin/contents/{id}": {
        get: {
          tags: ["Admin"],
          security: bearerSecurity,
          summary: "Admin content detail",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Content detail" }, "404": { description: "Not found" } }
        },
        put: {
          tags: ["Admin"],
          security: bearerSecurity,
          summary: "Update content",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Updated content" } }
        },
        delete: {
          tags: ["Admin"],
          security: bearerSecurity,
          summary: "Delete content",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Delete result" } }
        }
      },
      "/api/admin/categories": {
        get: {
          tags: ["Admin"],
          security: bearerSecurity,
          summary: "Admin categories",
          responses: { "200": { description: "Categories" } }
        },
        post: {
          tags: ["Admin"],
          security: bearerSecurity,
          summary: "Create or update category",
          responses: { "200": { description: "Category" } }
        }
      },
      "/api/admin/tags": {
        get: {
          tags: ["Admin"],
          security: bearerSecurity,
          summary: "Admin tags",
          responses: { "200": { description: "Tags" } }
        },
        post: {
          tags: ["Admin"],
          security: bearerSecurity,
          summary: "Create or update tag",
          responses: { "200": { description: "Tag" } }
        }
      },
      "/api/admin/settings": {
        get: {
          tags: ["Admin"],
          security: bearerSecurity,
          summary: "Admin settings",
          responses: { "200": { description: "Settings" } }
        },
        put: {
          tags: ["Admin"],
          security: bearerSecurity,
          summary: "Update settings",
          responses: { "200": { description: "Settings" } }
        }
      }
    }
  };
}
