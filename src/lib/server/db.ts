import { Signer } from '@aws-sdk/rds-signer'
import postgres from 'postgres'

import {
  ATBlob,
  ATBlobInput,
  Backup,
  BackupInput,
  Snapshot,
  SnapshotInput,
} from '@/app/types'

// will use psql environment variables
// https://github.com/porsager/postgres?tab=readme-ov-file#environmental-variables

const {
  PGHOST,
  PGPORT,
  PGDATABASE,
  PGUSERNAME,
  PGPASSWORD,
  PG_RDS_IAM_AUTH,
  PGSSLMODE,
} = process.env

const isValidSSLValue = (
  sslstring: string
): sslstring is 'require' | 'allow' | 'prefer' | 'verify-full' =>
  ['require', 'allow', 'prefer', 'verify-full'].includes(sslstring)
const validSSLValue = (sslstring: string | undefined) => {
  return sslstring
    ? isValidSSLValue(sslstring)
      ? sslstring
      : undefined
    : undefined
}

export const sql = postgres({
  host: PGHOST,
  port: Number(PGPORT),
  database: PGDATABASE,
  user: PGUSERNAME,
  password: PG_RDS_IAM_AUTH
    ? async () => {
        const signer = new Signer({
          hostname: PGHOST || '',
          port: parseInt(PGPORT || ''),
          username: PGUSERNAME || '',
        })
        const token = await signer.getAuthToken()
        return token
      }
    : PGPASSWORD,
  ssl: validSSLValue(PGSSLMODE),
  idle_timeout: 1,
  transform: {
    ...postgres.camel,
    undefined: null,
  },
})

interface ListResult {
  keys: { name: string }[]
}

interface KVNamespacePutOptions {
  expirationTtl?: number
}

interface KVNamespaceListOptions {
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
  updateSnapshot: (id: string, input: Partial<Snapshot>) => Promise<Snapshot>
  findSnapshots: (backupId: string) => Promise<{ results: Snapshot[] }>
  findSnapshot: (id: string) => Promise<{ result: Snapshot | undefined }>
  findBackups: (account: string) => Promise<{ results: Backup[] }>
  findBackup: (id: string) => Promise<{ result: Backup | undefined }>
  findScheduledBackups: () => Promise<{ results: Backup[] }>
  addBackup: (input: BackupInput) => Promise<Backup>
  addBlob: (input: ATBlobInput) => Promise<ATBlob>
  findBlobsForBackup: (id: string) => Promise<{ results: ATBlob[] }>
  findBlobsForSnapshot: (id: string) => Promise<{ results: ATBlob[] }>
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

      async findBlobsForBackup(id) {
        const results = await sql<ATBlob[]>`
          select
            cid,
            backup_id,
            snapshot_id,
            created_at
          from blobs
          where backup_id = ${id}
          `
        return {
          results,
        }
      },

      async findBlobsForSnapshot(id) {
        const results = await sql<ATBlob[]>`
          select
            cid,
            backup_id,
            snapshot_id,
            created_at
          from blobs
          where snapshot_id = ${id}
          `
        return {
          results,
        }
      },
      async findSnapshot(id: string) {
        const [result] = await sql<Snapshot[]>`
          select *
          from snapshots
          where id = ${id}
        `

        return {
          result,
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
          select *
          from snapshots
          where backup_id = ${backupId}
        `
        return {
          results,
        }
      },
      async addBackup(input) {
        const results = await sql<Backup[]>`
          insert into backups ${sql(input)}
          returning *
        `
        if (!results[0]) {
          throw new Error('error inserting backup')
        }
        return results[0]
      },
      async findBackups(account: string) {
        const results = await sql<Backup[]>`
          select *
          from backups
          where account_did = ${account}
        `
        return {
          results,
        }
      },
      async findScheduledBackups() {
        const results = await sql<Backup[]>`
          select *
          from backups
          where delegation_cid is not null
        `
        return {
          results,
        }
      },
      async findBackup(id: string) {
        const [result] = await sql<Backup[]>`
          select *
          from backups
          where id = ${id}
        `
        return {
          result,
        }
      },
    },
  }
}
