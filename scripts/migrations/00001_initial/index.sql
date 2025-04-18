create table schedules (
  id integer primary key generated always as identity,
  account_did text not null,
  name text,
  bluesky_account text,
  storacha_space text,
  include_repository boolean,
  include_blobs boolean,
  include_preferences boolean,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp

);

create table backups (
  id integer primary key generated always as identity,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp,
  schedule_id integer,
  repository_cid text,
  blobs_cid text,
  preferences_cid text
);