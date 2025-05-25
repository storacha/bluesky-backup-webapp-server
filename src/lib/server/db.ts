import { randomUUID } from 'node:crypto'

import { RuntimeLock } from '@atproto/oauth-client-node'
import { Signer } from '@aws-sdk/rds-signer'
import retry from 'p-retry'
import postgres from 'postgres'
import { validate as validateUUID } from 'uuid'
import { z } from 'zod'

import {
  ATBlob,
  ATBlobInput,
  Backup,
  BackupInput,
  Snapshot,
  SnapshotInput,
} from '@/types'

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
      return { keys: results.map((r: { key: string }) => ({ name: r.key })) }
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
export const requestLock: RuntimeLock = async (key: string, fn: () => Promise<unknown>) => {
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
  findSnapshots: (backupId: string) => Promise<{ results: Snapshot[] }>
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
}

interface StorageContext {
  authSessionStore: KVNamespace
  authStateStore: KVNamespace
  db: BBDatabase
}

// Input validation schemas
const UUIDSchema = z.string().uuid()

// Define SnapshotStatus enum
const SnapshotStatus = z.enum(['pending', 'completed', 'failed'])
type SnapshotStatus = z.infer<typeof SnapshotStatus>

const BackupInputSchema = z.object({
  id: z.string().uuid(),
  account: z.string().min(1).max(255),
  createdAt: z.date(),
  updatedAt: z.date(),
  atprotoAccount: z.string().min(1),
  accountDid: z.string().min(1),
  name: z.string().min(1),
  storachaSpace: z.string().min(1),
  includeRepository: z.boolean(),
  includeBlobs: z.boolean(),
  includePreferences: z.boolean(),
  delegationCid: z.string().optional(),
  delegationStatus: z.string().optional(),
  repositoryStatus: z.string().optional(),
  repositoryCid: z.string().optional(),
  blobsStatus: z.string().optional(),
  preferencesStatus: z.string().optional(),
  preferencesCid: z.string().optional()
})

const SnapshotInputSchema = z.object({
  id: z.string().uuid(),
  backupId: z.string().uuid(),
  createdAt: z.date(),
  atprotoAccount: z.string().min(1),
  accountDid: z.string().min(1),
  name: z.string().min(1),
  storachaSpace: z.string().min(1),
  repositoryStatus: SnapshotStatus.optional(),
  repositoryCid: z.string().optional(),
  blobsStatus: SnapshotStatus.optional(),
  preferencesStatus: SnapshotStatus.optional(),
  preferencesCid: z.string().optional(),
  delegationCid: z.string().optional(),
  delegationStatus: z.string().optional()
})

// Input validation functions
export function validateBackupInput(input: unknown): BackupInput {
  return BackupInputSchema.parse(input)
}

export function validateSnapshotInput(input: unknown): SnapshotInput {
  return SnapshotInputSchema.parse(input)
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
        try {
          const validatedId = UUIDSchema.parse(id)
          const [result] = await sql<Snapshot[]>`
            select *
            from snapshots
            where id = ${validatedId}
          `
          return { result }
        } catch (error) {
          console.error('Error finding snapshot:', error)
          return { result: undefined }
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
        try {
          const validatedBackupId = UUIDSchema.parse(backupId)
          const results = await sql<Snapshot[]>`
            select *
            from snapshots
            where backup_id = ${validatedBackupId}
          `
          return { results }
        } catch (error) {
          console.error('Error finding snapshots:', error)
          return { results: [] }
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
      async findBackup(id) {
        try {
          const validatedId = UUIDSchema.parse(id)
          const [result] = await sql<Backup[]>`
            select *
            from backups
            where id = ${validatedId}
          `
          return { result }
        } catch (error) {
          console.error('Error finding backup:', error)
          return { result: undefined }
        }
      },
    },
  }
}
