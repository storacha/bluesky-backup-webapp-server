import db, { Backup, BackupsDB, Repo, Blob, PrefsDoc, KeyMeta } from './db'

interface EncryptableOptions {
  encryptedWith?: string
}

type RepoOptions = EncryptableOptions & {
  repoCid?: string
}
type PrefsDocOptions = EncryptableOptions

type BlobOptions = EncryptableOptions & {
  contentType?: string
}

export interface BackupMetadataStore {
  addRepo: (
    cid: string,
    backupId: number,
    accountDid: string,
    commit: string,
    opts?: RepoOptions
  ) => Promise<void>
  addPrefsDoc: (
    cid: string,
    backupId: number,
    accountDid: string,
    opts?: PrefsDocOptions
  ) => Promise<void>
  addBlob: (
    cid: string,
    backupId: number,
    accountDid: string,
    opts?: BlobOptions
  ) => Promise<void>
  addBackup: (accountDid: string) => Promise<number>
  addKey: (id: string, symkeyCid: string) => Promise<KeyMeta>
  listBackups: () => Promise<Backup[]>
  getRepo: (backupId: number) => Promise<Repo | undefined>
  listBlobs: (backupId: number) => Promise<Blob[]>
  getPrefsDoc: (backupId: number) => Promise<PrefsDoc | undefined>
  listKeys: () => Promise<KeyMeta[]>
  deleteKey: (id: string) => Promise<unknown>
}

type BackupMetadataStoreInitializer = (db: BackupsDB) => BackupMetadataStore

export const newBackupMetadataStore: BackupMetadataStoreInitializer = (db) => ({
  async addRepo(
    cid,
    backupId,
    accountDid,
    commit,
    { encryptedWith, repoCid } = {}
  ) {
    await db.repos.put({
      cid,
      repoCid,
      backupId,
      accountDid,
      commit,
      createdAt: new Date(),
      encryptedWith,
    })
  },
  async addPrefsDoc(cid, backupId, accountDid, { encryptedWith } = {}) {
    await db.prefsDocs.put({
      cid,
      backupId,
      accountDid,
      createdAt: new Date(),
      encryptedWith,
    })
  },
  async addBlob(
    cid,
    backupId,
    accountDid,
    { contentType, encryptedWith } = {}
  ) {
    await db.blobs.put({
      cid,
      contentType,
      backupId,
      accountDid,
      createdAt: new Date(),
      encryptedWith,
    })
  },
  async addBackup(accountDid) {
    return await db.backups.add({ accountDid, createdAt: new Date() })
  },
  async addKey(id, symkeyCid) {
    const value = { id, symkeyCid }
    await db.keys.put(value)
    return value
  },
  async listBackups() {
    return db.backups.toArray()
  },
  async getRepo(backupId) {
    return db.repos.where('backupId').equals(backupId).first()
  },
  async listBlobs(backupId) {
    return db.blobs.where('backupId').equals(backupId).toArray()
  },
  async getPrefsDoc(backupId) {
    return db.prefsDocs.where('backupId').equals(backupId).first()
  },
  async listKeys() {
    return db.keys.toArray()
  },
  async deleteKey(id) {
    await db.keys.delete(id)
  },
})

export const backupMetadataStore: BackupMetadataStore =
  newBackupMetadataStore(db)
