CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  post_slug TEXT NOT NULL,
  parent_id TEXT REFERENCES comments(id),
  author TEXT NOT NULL,
  body_md TEXT NOT NULL,
  body_html TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_comments_post ON comments(post_slug, created_at);
