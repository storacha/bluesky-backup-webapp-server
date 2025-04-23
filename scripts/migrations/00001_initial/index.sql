DROP TABLE IF EXISTS backups CASCADE;
CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  account_did TEXT NOT NULL,
  name TEXT NOT NULL,
  atproto_account TEXT NOT NULL CHECK (atproto_account LIKE 'did:%'),
  storacha_space TEXT NOT NULL CHECK (storacha_space LIKE 'did:key:%'),
  include_repository BOOLEAN NOT NULL,
  include_blobs BOOLEAN NOT NULL,
  include_preferences BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

DROP TABLE IF EXISTS snapshots CASCADE;
CREATE TABLE IF NOT EXISTS snapshots (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  backup_id INTEGER NOT NULL,
  atproto_account TEXT NOT NULL CHECK (atproto_account LIKE 'did:%'),
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
  FOREIGN KEY (backup_id) REFERENCES backups(id)
);

DROP TABLE IF EXISTS blobs CASCADE;
CREATE TABLE IF NOT EXISTS blobs (
  cid TEXT,
  content_type TEXT,
  backup_id INTEGER,
  FOREIGN KEY (backup_id) REFERENCES backups(id),
  snapshot_id INTEGER NOT NULL,
  FOREIGN KEY (snapshot_id) REFERENCES snapshots(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
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