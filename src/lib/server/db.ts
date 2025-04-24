import {
  ATBlob,
  ATBlobInput,
  Snapshot,
  Backup,
  BackupInput,
  SnapshotInput,
} from '@/app/types'
import postgres from 'postgres'

// will use psql environment variables
// https://github.com/porsager/postgres?tab=readme-ov-file#environmental-variables
export const sql = postgres({
  transform: {
    ...postgres.camel,
    undefined: null,
  },
})

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
  put: (
    key: string,
    value: string,
    options?: KVNamespacePutOptions
  ) => Promise<void>
  get: (key: string) => Promise<string | null>
  delete: (key: string) => Promise<void>
  list: (opts: KVNamespaceListOptions) => Promise<ListResult>
}

function newKvNamespace(table: string): KVNamespace {
  const tableSql = sql(table)
  return {
    put: async (key, value, options = {}) => {
      console.log('putting', key, 'to', table, 'with', options)
      const ttl = options.expirationTtl ?? null
      await sql`
      insert into ${tableSql} (
        key,
        value,
        expiration_ttl
      ) 
      values (
        ${key},
        ${value},
        ${ttl}
      ) 
      on conflict (key)
      do update set 
        value = ${value}, 
        expiration_ttl = ${ttl}
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
      return { keys: results.map((r) => ({ name: r.key })) }
    },
  }
}

export interface BBDatabase {
  addSnapshot: (input: SnapshotInput) => Promise<Snapshot>
  updateSnapshot: (id: number, input: Partial<Snapshot>) => Promise<Snapshot>
  findSnapshots: (backupId: string) => Promise<{ results: Snapshot[] }>
  findBackups: (account: string) => Promise<{ results: Backup[] }>
  findBackup: (
    id: number,
    account: string
  ) => Promise<{ result: Backup | undefined }>
  addBackup: (input: BackupInput) => Promise<Backup>
  addBlob: (input: ATBlobInput) => Promise<ATBlob>
  findBlobsForBackup: (backupId: string) => Promise<{ results: ATBlob[] }>
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
      async addBlob(input) {
        console.log('inserting', input)
        const results = await sql<ATBlob[]>`
        insert into blobs ${sql(input)}
        returning *
      `
        if (!results[0]) {
          throw new Error('error inserting blob')
        }
        return results[0]
      },

      async findBlobsForBackup(backupId) {
        const results = await sql<ATBlob[]>`
          select
            cid,
            backup_id,
            snapshot_id,
            created_at
          from blobs
          where backup_id = ${backupId}
          `
        return {
          results,
        }
      },

      async addSnapshot(input) {
        const results = await sql<Snapshot[]>`
          insert into snapshots ${sql(input)}
          returning *
        `
        if (!results[0]) {
          throw new Error('error inserting backup')
        }
        return results[0]
      },
      async updateSnapshot(id, input) {
        const results = await sql<Snapshot[]>`
          update snapshots set ${sql(input)}
          where id = ${id}
          returning *
        `
        if (!results[0]) {
          throw new Error('error inserting snapshot')
        }
        return results[0]
      },
      async findSnapshots(backupId) {
        const results = await sql<Snapshot[]>`
          select
            id,
            backup_id,
            repository_cid,
            preferences_cid,
            created_at
          from snapshots
          where backup_id = ${backupId}
          `
        return {
          results,
        }
      },
      async addBackup(input) {
        const results = await sql<Backup[]>`
          INSERT INTO backups (
            account_did,
            name,
            atproto_account,
            storacha_space,
            include_repository,
            include_blobs,
            include_preferences
          ) values (
            ${input.accountDid},
            ${input.name},
            ${input.atprotoAccount},
            ${input.storachaSpace},
            ${input.includeRepository},
            ${input.includeBlobs},
            ${input.includePreferences}
          )
          returning *
        `
        if (!results[0]) {
          throw new Error('error inserting backup config')
        }
        return results[0]
      },
      async findBackups(account: string) {
        const results = await sql<Backup[]>`
            SELECT id,
              name,
              atproto_account,
              storacha_space,
              include_repository,
              include_blobs,
              include_preferences

             FROM backups
             WHERE account_did = ${account}
          `
        return {
          results,
        }
      },
      async findBackup(configId: number, account: string) {
        const [result] = await sql<Backup[]>`
            SELECT id,
              name,
              atproto_account,
              storacha_space,
              include_repository,
              include_blobs,
              include_preferences

             FROM backups
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
