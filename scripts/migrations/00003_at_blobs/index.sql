-- DROP TABLE IF EXISTS at_blobs;

CREATE TABLE IF NOT EXISTS at_blobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cid TEXT NOT NULL,
  content_type TEXT,
  backup_id UUID,
  FOREIGN KEY (backup_id) REFERENCES backups(id),
  snapshot_id UUID NOT NULL,
  FOREIGN KEY (snapshot_id) REFERENCES snapshots(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);