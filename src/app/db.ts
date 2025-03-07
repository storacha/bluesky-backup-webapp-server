'use client'

import Dexie, { type EntityTable } from 'dexie'

interface Backup {
  id: number;
  accountDid: string;
  createdAt: Date;
}

interface Repo {
  cid: string;
  uploadCid: string;
  backupId: number;
  accountDid: string;
}

interface Blob {
  cid: string;
  backupId: number;
  accountDid: string;
}

interface Commit {
  accountDid: string;
  commitRev: string;
}

const db = new Dexie('storacha-bluesky-backups') as Dexie & {
  backups: EntityTable<
    Backup,
    'id'
  >;
  repos: EntityTable<
    Repo,
    'cid'
  >;
  blobs: EntityTable<
    Blob,
    'cid'
  >;
  commits: EntityTable<
    Commit,
    'accountDid'
  >;
};

// Schema declaration:
db.version(1).stores({
  backups: 'id++, accountDid, createdAt',
  repos: 'cid, uploadCid, backupId, accountDid',
  blobs: 'cid, backupId, accountDid',
  commits: 'accountDid, commitRev'
});

export default db