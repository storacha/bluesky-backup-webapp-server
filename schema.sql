DROP TABLE IF EXISTS backup_configs;
CREATE TABLE IF NOT EXISTS backup_configs (
  id INTEGER PRIMARY KEY,
  account_did TEXT NOT NULL,
  name TEXT NOT NULL,
  bluesky_account TEXT NOT NULL,
  storacha_space TEXT NOT NULL,
  include_repository BOOLEAN NOT NULL,
  include_blobs BOOLEAN NOT NULL,
  include_preferences BOOLEAN NOT NULL
);