-- Allow us to rebuild the tables without worrying about foreign key constraints
-- during the process.
PRAGMA defer_foreign_keys = ON;

DROP TABLE IF EXISTS backup_configs;
DROP TABLE IF EXISTS backups;

CREATE TABLE IF NOT EXISTS backup_configs (
  id INTEGER PRIMARY KEY,
  account_did TEXT NOT NULL,
  name TEXT NOT NULL,
  atproto_account TEXT NOT NULL CHECK (atproto_account LIKE 'did:%'),
  storacha_space TEXT NOT NULL CHECK (storacha_space LIKE 'did:key:%'),
  include_repository BOOLEAN NOT NULL,
  include_blobs BOOLEAN NOT NULL,
  include_preferences BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY,
  backup_config_id INTEGER NOT NULL,
  repository_status TEXT DEFAULT 'not-started' CHECK (
    repository_status IN (
      'not-started',
      'in-progress',
      'failed',
      'success'
    )
  ),
  repository_cid TEXT,
  blobs_status TEXT DEFAULT 'not-started' CHECK (
    blobs_status IN (
      'not-started',
      'in-progress',
      'failed',
      'success'
    )
  ),
  blobs_cid TEXT,
  preferences_status TEXT DEFAULT 'not-started' CHECK (
    preferences_status IN (
      'not-started',
      'in-progress',
      'failed',
      'success'
    )
  ),
  preferences_cid TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (backup_config_id) REFERENCES backup_configs(id)
);