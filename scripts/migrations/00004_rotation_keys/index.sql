-- DROP TABLE IF EXISTS rotation_keys CASCADE;

CREATE TABLE IF NOT EXISTS rotation_keys (
  id TEXT PRIMARY KEY,
  storacha_account TEXT NOT NULL,
  atproto_account TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
