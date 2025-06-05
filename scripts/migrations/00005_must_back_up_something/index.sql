-- ALTER TABLE backups DROP CONSTRAINT IF EXISTS must_back_up_something;

ALTER TABLE backups
ADD CONSTRAINT must_back_up_something CHECK (
    include_repository
    OR include_blobs
    OR include_preferences
  );
