import {
  Backup,
  BackupConfig,
  BackupConfigInput,
  BackupInput,
} from '@/app/types'
import postgres from 'postgres'

// will use psql environment variables
// https://github.com/porsager/postgres?tab=readme-ov-file#environmental-variables
export const sql = postgres()

export interface ListResult {
  keys: { name: string }[]
}

export interface KVNamespacePutOptions {
  expirationTtl?: number
}

export interface KVNamespaceListOptions {
  limit?: number
  prefix?: string | null
  cursor?: string | null
}
export interface KVNamespace {
  put: (key: string, value: string, options?: KVNamespacePutOptions) => Promise<void>
  get: (key: string) => Promise<string | null>
  delete: (key: string) => Promise<void>
  list: (opts: KVNamespaceListOptions) => Promise<ListResult>
}

function newKvNamespace (table: string): KVNamespace {
  const tableSql = sql(table)
  // TODO: needs to be implemented to match the Cloudflare KVNamespace semantics
  return {
    put: async (key, value, options = {}) => {
      console.log('putting', key, 'to', table, 'with', options)
      await sql`
      insert into ${tableSql} (
        key,
        value,
        expiration_ttl
      ) values (
        ${key},
        ${value},
        ${options.expirationTtl || null}
      )
      `
    },
    get: async (key) => {
      console.log('getting', key, 'from', table)
      const results = await sql<{ value: string }[]>`
        select value
        from ${tableSql}
        where key = ${key}
      `
      if (results[0]) {
        return results[0].value
      } else {
        return null
      }
    },

    delete: async (key) => {
      console.log('deleting', key, 'from', table)
      await sql`delete from ${tableSql} where key = ${key}`

    },

    list: async ({ prefix }) => {
      console.log('listing keys with prefix', prefix, 'in', table)
      const results = await sql<{ key: string }[]>`
      select key
      from ${tableSql}
      where key like ${`${prefix}%`}
    `
      console.log({ keys: results.map(r => ({ name: r.key })) })
      return { keys: results.map(r => ({ name: r.key })) }
    }
  }
}

export interface BBDatabase {
  addBackup: (input: BackupInput) => Promise<Backup>
  updateBackup: (id: number, input: Partial<Backup>) => Promise<Backup>
  findBackups: (backupConfigId: string) => Promise<{ results: Backup[] }>
  findBackupConfigs: (account: string) => Promise<{ results: BackupConfig[] }>
  findBackupConfig: (
    id: number,
    account: string
  ) => Promise<{ result: BackupConfig | undefined }>
  addBackupConfig: (input: BackupConfigInput) => Promise<BackupConfig>
}

interface StorageContext {
  authSessionStore: KVNamespace
  authStateStore: KVNamespace
  db: BBDatabase
}

export function getStorageContext(): StorageContext {
  return {
    authSessionStore: newKvNamespace('auth_sessions'),
    authStateStore: newKvNamespace('auth_states'),
    db: {
      async addBackup(input) {
        const results = await sql<Backup[]>`
          insert into backups ${sql(input)}}
          returning *
        `
        if (!results[0]) {
          throw new Error('error inserting backup')
        }
        return results[0]
      },
      async updateBackup(id, input) {
        const results = await sql<Backup[]>`
          update backups set ${sql(input)}}
          returning *
        `
        if (!results[0]) {
          throw new Error('error inserting backup')
        }
        return results[0]
      },
      async findBackups(backupConfigId) {
        const results = await sql<Backup[]>`
          select
            id,
            backup_configs_id,
            repository_cid,
            blobs_cid,
            preferences_cid,
            created_at
          from backups
          where backup_configs_id = ${backupConfigId}
          `
        return {
          results,
        }
      },
      async addBackupConfig(input) {
        const results = await sql<BackupConfig[]>`
          INSERT INTO backup_configs (
            account_did,
            name,
            atproto_account,
            storacha_space,
            include_repository,
            include_blobs,
            include_preferences
          ) values (
            ${input.account_did},
            ${input.name},
            ${input.atproto_account},
            ${input.storacha_space},
            ${input.include_repository},
            ${input.include_blobs},
            ${input.include_preferences}
          )
          returning *
        `
        if (!results[0]) {
          throw new Error('error inserting backup config')
        }
        return results[0]
      },
      async findBackupConfigs(account: string) {
        console.log(`TODO: find backup configs for ${account}`)
        const results = await sql<BackupConfig[]>`
            SELECT id,
              name,
              atproto_account,
              storacha_space,
              include_repository,
              include_blobs,
              include_preferences

             FROM backup_configs
             WHERE account_did = ${account}
          `
        return {
          results,
        }
      },
      async findBackupConfig(configId: number, account: string) {
        const [result] = await sql<BackupConfig[]>`
            SELECT id,
              name,
              atproto_account,
              storacha_space,
              include_repository,
              include_blobs,
              include_preferences

             FROM backup_configs
             WHERE id = ${configId}
               AND account_did = ${account}
          `

        return {
          result,
        }
      },
    },
  }
}
