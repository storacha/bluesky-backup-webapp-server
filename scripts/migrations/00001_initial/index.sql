DROP TABLE IF EXISTS backup_configs CASCADE;
CREATE TABLE IF NOT EXISTS backup_configs (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  account_did TEXT NOT NULL,
  name TEXT NOT NULL,
  bluesky_account TEXT NOT NULL,
  storacha_space TEXT NOT NULL,
  include_repository BOOLEAN NOT NULL,
  include_blobs BOOLEAN NOT NULL,
  include_preferences BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

DROP TABLE IF EXISTS backups CASCADE;
CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  backup_configs_id INTEGER NOT NULL,
  repository_cid TEXT,
  blobs_cid TEXT,
  preferences_cid TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (backup_configs_id) REFERENCES backup_configs(id)
);

DROP TABLE IF EXISTS auth_sessions;
CREATE TABLE IF NOT EXISTS auth_sessions (
  key TEXT PRIMARY KEY,
  value TEXT,
  expiration_ttl INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

DROP TABLE IF EXISTS auth_states;
CREATE TABLE IF NOT EXISTS auth_states (
  key TEXT PRIMARY KEY,
  value TEXT,
  expiration_ttl INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);