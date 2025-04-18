import { Backup, BackupConfig, BackupConfigInput, BackupInput } from "@/app/types"
import postgres from 'postgres'

// will use psql environment variables
// https://github.com/porsager/postgres?tab=readme-ov-file#environmental-variables
export const sql = postgres()

export interface ListResult {
  keys: { name: string }[]
}

export interface KVNamespace {
  put: (...p: unknown[]) => unknown
  get: (g: unknown) => string
  delete: (d: unknown) => void
  list: (l: unknown) => Promise<ListResult>
}

function newKvNamespace (): KVNamespace {
  // TODO: needs to be implemented to match the Cloudflare KVNamespace semantics
  return {
    put: (...args) => {
      console.log(args)
    },
    get: (k) => {
      console.log(k)
      return "{}"
    },

    delete: (d) => {
      console.log(d)
    },

    list: async (k) => {
      console.log(k)
      return { keys: [] }
    }
  }
}

interface BBDatabase {
  addBackup: (input: BackupInput) => Promise<Backup>
  findBackups: (backupConfigId: string) => Promise<{ results: Backup[] }>
  findBackupConfigs: (account: string) => Promise<{ results: BackupConfig[] }>
  addBackupConfig: (input: BackupConfigInput) => Promise<BackupConfig>
}

interface StorageContext {
  authSessionStore: KVNamespace
  authStateStore: KVNamespace
  db: BBDatabase
}

export function getStorageContext (): StorageContext {
  return {
    authSessionStore: newKvNamespace(),
    authStateStore: newKvNamespace(),
    db: {
      async addBackup (input) {
        // D1 code:
        // const backupConfig = await DB.prepare(
        //   /* sql */ `
        //   INSERT INTO backups (
        //     backup_configs_id,
        //     repository_cid,
        //     blobs_cid,
        //     preferences_cid
        //   )
        //   VALUES(?, ?, ?, ?)
        //   RETURNING id
        // `
        // )
        //   .bind(
        //     1,
        //     'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551repo',
        //     'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551blob',
        //     'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy551pref'
        //   )
        //   .first()
        console.log(`TODO: implement add backup, data: ${input}`)
        return { id: 1, created_at: new Date().toString(), ...input }
      },
      async findBackups (backupConfigId) {
        console.log(`TODO: implement find backups, data: ${backupConfigId}`)
        // D1 code:
        // const { results } = await DB.prepare(
        //   /* sql */ `
        //     SELECT id,
        //       backup_configs_id,
        //       repository_cid,
        //       blobs_cid,
        //       preferences_cid,
        //       created_at

        //      FROM backups

        //     WHERE backup_configs_id = ?

        //     -- TODO: Fetch configs for correct account
        //   `
        // )
        //   .bind(id)
        //   .all<Backup>()
        return {
          results: [] as Backup[]
        }
      },
      async addBackupConfig (input) {
        console.log(`TODO: implement add backup config, data: ${input}`)
        // D1 code:
        // const backupConfig = await DB.prepare(
        //   /* sql */ `
        //   INSERT INTO backup_configs (
        //     account_did,
        //     name,
        //     bluesky_account,
        //     storacha_space,
        //     include_repository,
        //     include_blobs,
        //     include_preferences
        //   )
        //   VALUES(?, ?, ?, ?, ?, ?, ?)
        //   RETURNING id
        // `
        // )
        //   .bind(
        //     data.get('account'),
        //     data.get('name'),
        //     data.get('bluesky_account'),
        //     data.get('storacha_space'),
        //     data.get('include_repository') === 'on' ? true : false,
        //     data.get('include_blobs') === 'on' ? true : false,
        //     data.get('include_preferences') === 'on' ? true : false
        //   )
        //   .first()
        return { id: 1, ...input }
      },
      async findBackupConfigs (account: string) {
        console.log(`TODO: find backup configs for ${account}`)
        // D1 code:
        // const { results } = await DB.prepare(
        //   /* sql */ `
        //     SELECT id,
        //       name,
        //       bluesky_account,
        //       storacha_space,
        //       include_repository,
        //       include_blobs,
        //       include_preferences

        //      FROM backup_configs
        //      WHERE account_did = ?
        //   `
        // )
        //   .bind(did)
        //   .all<BackupConfig>()
        return {
          results: [] as BackupConfig[]
        }
      }
    }
  }
}