-- ALTER TABLE snapshots DROP COLUMN repository_upload_cid;

ALTER TABLE snapshots
ADD COLUMN repository_upload_cid TEXT;
