import { randomUUID } from 'node:crypto'

import { RuntimeLock } from '@atproto/oauth-client-node'
import { Signer } from '@aws-sdk/rds-signer'
import retry from 'p-retry'
import postgres from 'postgres'
import { validate as validateUUID } from 'uuid'

import {
  ATBlob,
  ATBlobInput,
  Backup,
  BackupInput,
  PaginatedResult,
  PaginatedResultParams,
  RotationKey,
  RotationKeyInput,
  Snapshot,
  SnapshotInput,
} from '@/types'

import { PAGINATED_RESULTS_LIMIT } from '../constants'

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
      await sql`delete from ${tableSql} where key = ${key}`
    },

    list: async ({ prefix }) => {
      const results = await sql<{ key: string }[]>`
      select key
      from ${tableSql}
      where key like ${`${prefix}%`}
    `
      return { keys: results.map((r) => ({ name: r.key })) }
    },
  }
}

interface SqlSemaphore {
  lock: (key: string) => Promise<string>
  unlock: (key: string, lockId: string) => Promise<void>
}

function newLock(table: string): SqlSemaphore {
  const tableSql = sql(table)
  return {
    lock: async (key: string) => {
      const value = randomUUID().toString()
      await retry(
        async () => {
          await sql`
            insert into ${tableSql} ( key, value )
            values ( ${key}, ${value} )
          `
        },
        {
          // try for 30 seconds per the comment in the requestLock docs on
          // https://www.npmjs.com/package/@atproto/oauth-client-node
          maxRetryTime: 30 * 1000,
        }
      )
      return value
    },
    unlock: async (key: string, lockId: string) => {
      await sql`
      delete from ${tableSql}
      where key = ${key}
      and value = ${lockId}`
    },
  }
}

const sem = newLock('refresh_locks')
export const requestLock: RuntimeLock = async (key, fn) => {
  const lockId = await sem.lock(key)
  try {
    return await fn()
  } finally {
    await sem.unlock(key, lockId)
  }
}

export interface BBDatabase {
  addSnapshot: (input: SnapshotInput) => Promise<Snapshot>
  updateSnapshot: (id: string, input: Partial<Snapshot>) => Promise<Snapshot>
  findSnapshots: (
    backupId: string,
    options?: Partial<PaginatedResultParams>
  ) => Promise<PaginatedResult<Snapshot>>
  findSnapshot: (id: string) => Promise<{ result: Snapshot | undefined }>
  findBackups: (account: string) => Promise<{ results: Backup[] }>
  findBackup: (id: string) => Promise<{ result: Backup | undefined }>
  findScheduledBackups: () => Promise<{ results: Backup[] }>
  addBackup: (input: BackupInput) => Promise<Backup>
  addBlob: (input: ATBlobInput) => Promise<ATBlob>
  getBlobInBackup: (
    cid: string,
    backupId: string
  ) => Promise<{ result: ATBlob | undefined }>
  findBlobsForBackup: (id: string) => Promise<{ results: ATBlob[] }>
  findBlobsForSnapshot: (id: string) => Promise<{ results: ATBlob[] }>
  addRotationKey: (input: RotationKeyInput) => Promise<RotationKey>
  findRotationKeys: (
    storachaAccount: string
  ) => Promise<{ results: RotationKey[] }>
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
        const results = await sql<ATBlob[]>`
        insert into at_blobs ${sql(input)}
        returning *
      `
        if (!results[0]) {
          throw new Error('error inserting blob')
        }
        return results[0]
      },

      async getBlobInBackup(cid: string, backupId: string) {
        const [result] = await sql<ATBlob[]>`
          select *
          from at_blobs
          where cid = ${cid}
          and backup_id = ${backupId}
        `
        return { result }
      },

      async findBlobsForBackup(id) {
        if (!validateUUID(id)) return { results: [] }

        const results = await sql<ATBlob[]>`
          select * from at_blobs
          where backup_id = ${id}
          `
        return {
          results,
        }
      },

      async findBlobsForSnapshot(id) {
        if (!validateUUID(id)) return { results: [] }

        const results = await sql<ATBlob[]>`
          select * from at_blobs
          where snapshot_id = ${id}
          `
        return {
          results,
        }
      },
      async findSnapshot(id) {
        if (!validateUUID(id)) return { result: undefined }

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
      async findSnapshots(backupId, options?: PaginatedResultParams) {
        const { limit = PAGINATED_RESULTS_LIMIT, page = 1 } = options ?? {}
        const offset = (page - 1) * limit

        if (!validateUUID(backupId))
          return {
            count: 0,
            next: null,
            prev: null,
            results: [],
          }

        const total = await sql<{ count: number }[]>`
          select count(*) as count
          from snapshots
          where backup_id = ${backupId}
        `

        const results = await sql<Snapshot[]>`
          select *
          from snapshots
          where backup_id = ${backupId}
          order by created_at desc
          limit ${limit}
          offset ${offset}
        `

        const count = Number(total[0]?.count) ?? 0

        return {
          count: count,
          results: results || [],
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
          order by created_at desc
          limit 10
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
      async findBackup(id) {
        if (!validateUUID(id)) return { result: undefined }

        const [result] = await sql<Backup[]>`
          select *
          from backups
          where id = ${id}
        `
        return {
          result,
        }
      },
      async addRotationKey(input: RotationKeyInput) {
        const results = await sql<RotationKey[]>`
          insert into rotation_keys ${sql(input)}
          returning *
        `
        if (!results[0]) {
          throw new Error('error inserting rotation key')
        }
        return results[0]
      },
      async findRotationKeys(storachaAccount: string) {
        const results = await sql<RotationKey[]>`
          select *
          from rotation_keys
          where storacha_account = ${storachaAccount}
        `
        return {
          results,
        }
      },
    },
  }
}
