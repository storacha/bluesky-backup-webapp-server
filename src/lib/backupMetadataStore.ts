import db, { Backup, BackupsDB, Repo, Blob, PrefsDoc } from "./db"

interface BlobOptions {
  contentType?: string
}

export interface BackupMetadataStore {
  setLatestCommit: (accountDid: string, commitRev: string) => Promise<void>
  addRepo: (cid: string, uploadCid: string, backupId: number, accountDid: string) => Promise<void>
  addPrefsDoc: (cid: string, backupId: number, accountDid: string) => Promise<void>
  addBlob: (cid: string, backupId: number, accountDid: string, opts: BlobOptions) => Promise<void>
  addBackup: (accountDid: string) => Promise<number>
  listBackups: () => Promise<Backup[]>
  getRepo: (backupId: number) => Promise<Repo | undefined>
  listBlobs: (backupId: number) => Promise<Blob[]>
  getPrefsDoc: (backupId: number) => Promise<PrefsDoc | undefined>
}

type BackupMetadataStoreInitializer = (db: BackupsDB) => BackupMetadataStore

export const newBackupMetadataStore: BackupMetadataStoreInitializer = (db) => ({
  async setLatestCommit (accountDid, commitRev) {
    await db.commits.put({ accountDid, commitRev })
  },
  async addRepo (cid, uploadCid, backupId, accountDid) {
    await db.repos.put({ cid, uploadCid, backupId, accountDid })
  },
  async addPrefsDoc (cid, backupId, accountDid) {
    await db.prefsDocs.put({ cid, backupId, accountDid })
  },
  async addBlob (cid, backupId, accountDid, { contentType } = {}) {
    await db.blobs.put({ cid, contentType, backupId, accountDid })
  },
  async addBackup (accountDid) {
    return await db.backups.add({ accountDid, createdAt: new Date() })
  },
  async listBackups () {
    return db.backups.toArray()
  },
  async getRepo (backupId) {
    return db.repos.where('backupId').equals(backupId).first()
  },
  async listBlobs (backupId) {
    return db.blobs.where('backupId').equals(backupId).toArray()
  },
  async getPrefsDoc (backupId) {
    return db.prefsDocs.where('backupId').equals(backupId).first()
  }
})

export const backupMetadataStore: BackupMetadataStore = newBackupMetadataStore(db)