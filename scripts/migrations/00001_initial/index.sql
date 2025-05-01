-- DROP TABLE IF EXISTS snapshots CASCADE;
-- DROP TABLE IF EXISTS backups CASCADE;
-- DROP TABLE IF EXISTS blobs CASCADE;
-- DROP TABLE IF EXISTS auth_sessions;
-- DROP TABLE IF EXISTS auth_states;

CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_did TEXT NOT NULL,
  name TEXT NOT NULL,
  atproto_account TEXT NOT NULL CHECK (atproto_account LIKE 'did:%'),
  storacha_space TEXT NOT NULL CHECK (storacha_space LIKE 'did:key:%'),
  include_repository BOOLEAN NOT NULL,
  include_blobs BOOLEAN NOT NULL,
  include_preferences BOOLEAN NOT NULL,
  delegation_cid TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID NOT NULL,
  atproto_account TEXT NOT NULL CHECK (atproto_account LIKE 'did:%'),
  repo_rev TEXT,
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

CREATE TABLE IF NOT EXISTS blobs (
  cid TEXT PRIMARY KEY,
  content_type TEXT,
  backup_id UUID,
  FOREIGN KEY (backup_id) REFERENCES backups(id),
  snapshot_id UUID NOT NULL,
  FOREIGN KEY (snapshot_id) REFERENCES snapshots(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  key TEXT PRIMARY KEY,
  value TEXT,
  expiration_ttl INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_states (
  key TEXT PRIMARY KEY,
  value TEXT,
  expiration_ttl INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);