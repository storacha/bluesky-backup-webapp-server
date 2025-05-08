-- DROP TABLE IF EXISTS refresh_locks;

CREATE TABLE IF NOT EXISTS refresh_locks (
  key TEXT PRIMARY KEY,
  value TEXT
);
