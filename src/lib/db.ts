'use client'

import Dexie, { type EntityTable } from 'dexie'

export interface Backup {
  id: number;
  accountDid: string;
  createdAt: Date;
}

export interface Repo {
  cid: string;
  uploadCid: string;
  backupId: number;
  accountDid: string;
}

export interface Blob {
  cid: string;
  backupId: number;
  accountDid: string;
}

export interface Commit {
  accountDid: string;
  commitRev: string;
}

export type BackupsDB = Dexie & {
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
}

function newDB (name: string = 'storacha-bluesky-backups') {
  const db = new Dexie(name) as BackupsDB

  // Schema declaration:
  db.version(1).stores({
    backups: 'id++, accountDid, createdAt',
    repos: 'cid, uploadCid, backupId, accountDid',
    blobs: 'cid, backupId, accountDid',
    commits: 'accountDid, commitRev'
  })
  return db
}

export default newDB()
