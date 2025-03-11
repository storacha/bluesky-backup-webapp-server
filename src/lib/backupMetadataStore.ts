import db, { Backup, BackupsDB, Repo, Blob } from "./db"

export interface BackupMetadataStore {
    setLatestCommit: (accountDid: string, commitRev: string) => Promise<void>
    addRepo: (cid: string, uploadCid: string, backupId: number, accountDid: string) => Promise<void>
    addBlob: (cid: string, backupId: number, accountDid: string) => Promise<void>
    addBackup: (accountDid: string) => Promise<number>
    listBackups: () => Promise<Backup[]>
    listRepos: (backupId: number) => Promise<Repo[]>
    listBlobs: (backupId: number) => Promise<Blob[]>
}

type BackupMetadataStoreInitializer = (db: BackupsDB) => BackupMetadataStore

export const newBackupMetadataStore: BackupMetadataStoreInitializer = (db) => ({
  async setLatestCommit (accountDid, commitRev) {
    await db.commits.put({ accountDid, commitRev })
  },
  async addRepo (cid, uploadCid, backupId, accountDid) {
    await db.repos.put({ cid, uploadCid, backupId, accountDid })
  },
  async addBlob (cid, backupId, accountDid) {
    await db.blobs.put({ cid, backupId, accountDid })
  },
  async addBackup (accountDid) {
    return await db.backups.add({ accountDid, createdAt: new Date() })
  },
  async listBackups () {
    return db.backups.toArray()
  },
  async listRepos (backupId) {
    return db.repos.where('backupId').equals(backupId).toArray()
  },
  async listBlobs (backupId) {
    return db.blobs.where('backupId').equals(backupId).toArray()
  }
})

export const backupMetadataStore: BackupMetadataStore = newBackupMetadataStore(db)