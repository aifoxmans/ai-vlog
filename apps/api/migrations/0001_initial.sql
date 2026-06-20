CREATE TABLE IF NOT EXISTS contents (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL,
  status TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  cover_image TEXT,
  cover_alt TEXT,
  body_markdown TEXT NOT NULL,
  category_slug TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  seo_json TEXT NOT NULL DEFAULT '{}',
  video_json TEXT,
  metrics_json TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  reading_time INTEGER,
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contents_section ON contents(section);
CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_published_at ON contents(published_at);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  section TEXT NOT NULL,
  description TEXT,
  accent TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

