-- DROP TABLE IF EXISTS refresh_locks;

CREATE TABLE IF NOT EXISTS refresh_locks (
  key TEXT PRIMARY KEY,
  value TEXT,
  expiration_ttl INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
