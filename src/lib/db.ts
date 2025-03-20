'use client'

import Dexie, { type EntityTable } from 'dexie'

export interface Backup {
  id: number;
  accountDid: string;
  createdAt: Date;
}

export interface Repo {
  cid: string;
  repoCid?: string;
  backupId: number;
  accountDid: string;
  commit: string;
  createdAt: Date;
  encryptedWith?: string;
}
export interface PrefsDoc {
  cid: string;
  backupId: number;
  accountDid: string;
  createdAt: Date;
  encryptedWith?: string;
}

export interface Blob {
  cid: string;
  backupId: number;
  accountDid: string;
  contentType?: string;
  createdAt: Date;
  encryptedWith?: string;
}

export interface KeyMeta {
  id: string
  symkeyCid?: string
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
  prefsDocs: EntityTable<
    PrefsDoc,
    'cid'
  >;
  blobs: EntityTable<
    Blob,
    'cid'
  >;
  keys: EntityTable<
    KeyMeta,
    'id'
  >;
}

function newDB (name: string = 'storacha-bluesky-backups') {
  const db = new Dexie(name) as BackupsDB

  // Schema declaration:
  db.version(1).stores({
    backups: 'id++, accountDid, createdAt',
    repos: 'cid, repoCid, backupId, accountDid, commit, createdAt, encryptedWith',
    prefsDocs: 'cid, backupId, accountDid, createdAt, encryptedWith',
    blobs: 'cid, contentType, backupId, accountDid, createdAt, encryptedWith',
    keys: 'id, symkeyCid'
  })
  return db
}

export default newDB()
