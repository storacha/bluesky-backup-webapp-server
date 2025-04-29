ALTER TABLE backups ADD delegation_cid TEXT;
ALTER TABLE backups ADD last_repo_rev TEXT;

ALTER TABLE snapshots ADD repo_rev TEXT;
