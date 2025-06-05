import { RepoEntry } from '@atcute/car'
import { Secp256k1Keypair } from '@atproto/crypto'
import { z } from 'zod/v4'

const didSchema = z.templateLiteral(['did:', z.string()])
export type Did = z.infer<typeof didSchema>

const spaceDidSchema = z.templateLiteral(['did:key:', z.string()])
export type SpaceDid = z.infer<typeof spaceDidSchema>

const backupSchema = z.strictObject({
  id: z.string(),
  accountDid: z.string(),
  name: z.string(),
  atprotoAccount: didSchema,
  storachaSpace: spaceDidSchema,
  includeRepository: z.boolean(),
  includeBlobs: z.boolean(),
  includePreferences: z.boolean(),
  delegationCid: z.string().nullable(),
  paused: z.boolean(),
  archived: z.boolean(),
})

export type Backup = z.infer<typeof backupSchema>

export type Identity = Backup & {
  isConnected: boolean
}

const backupInputSchema = backupSchema
  .omit({
    id: true,
  })
  .partial({ paused: true, archived: true })

export type BackupInput = z.infer<typeof backupInputSchema>

export const backupInputUpdateSchema = backupInputSchema
  .pick({
    name: true,
    delegationCid: true,
    paused: true,
    archived: true,
  })
  .partial()

export type BackupInputUpdate = z.infer<typeof backupInputUpdateSchema>

const snapshotStatusSchema = z.enum([
  'not-started',
  'in-progress',
  'failed',
  'success',
])

const snapshotSchema = z.strictObject({
  id: z.string(),
  atprotoAccount: didSchema,
  backupId: z.string(),
  repositoryStatus: snapshotStatusSchema,
  repositoryCid: z.string().optional(),
  repositoryUploadCid: z.string().optional(),
  blobsStatus: snapshotStatusSchema,
  preferencesStatus: snapshotStatusSchema,
  preferencesCid: z.string().optional(),
  createdAt: z.string(),
})

export type Snapshot = z.infer<typeof snapshotSchema>

/* eslint-disable @typescript-eslint/no-unused-vars */
const snapshotInputSchema = snapshotSchema
  .omit({
    id: true,
    createdAt: true,
  })
  .partial({
    repositoryStatus: true,
    repositoryCid: true,
    repositoryUploadCid: true,
    blobsStatus: true,
    preferencesStatus: true,
    preferencesCid: true,
  })

export type SnapshotInput = z.infer<typeof snapshotInputSchema>

const stateSchema = z.enum(['loading', 'idle', 'deleting'])
export type State = z.infer<typeof stateSchema>

const atBlobSchema = z.strictObject({
  id: z.string(),
  cid: z.string(),
  contentType: z.string().optional(),
  snapshotId: z.string(),
  backupId: z.string().optional(),
  createdAt: z.string(),
})

export type ATBlob = z.infer<typeof atBlobSchema>

const atBlobInputSchema = atBlobSchema.omit({
  id: true,
  createdAt: true,
})

export type ATBlobInput = z.infer<typeof atBlobInputSchema>

const rotationKeySchema = z.strictObject({
  id: z.string(),
  keypair: z.instanceof(Secp256k1Keypair).optional(),
  storachaAccount: z.string(),
  atprotoAccount: z.string(),
  createdAt: z.string(),
})

export type RotationKey = z.infer<typeof rotationKeySchema>

const rotationKeyInputSchema = rotationKeySchema.omit({
  createdAt: true,
  keypair: true,
})

export type RotationKeyInput = z.infer<typeof rotationKeyInputSchema>

const rotationKeyClientInputSchema = rotationKeyInputSchema.omit({
  storachaAccount: true,
})

export type RotationKeyClientInput = z.infer<
  typeof rotationKeyClientInputSchema
>

export interface BlockMap {
  [cid: string]: string
}

export interface Repo {
  root: string
  blocks: BlockMap
}

export type Post = {
  createdAt: string
  text: string
  $type?: string
  author?: {
    handle: string
    displayName: string
  }
  creator?: string
  embed?: ExternalEmbeds | ImageEmbeds | QuotedEmbeds
}

export type ExternalEmbeds = {
  $type: 'app.bsky.embed.external'
  external: {
    uri: string
    title: string
    description: string
    thumb: {
      $type: string
      mimeType: string
      ref: {
        $link: string
      }
    }
  }
}

export type ImageEmbeds = {
  $type: 'app.bsky.embed.images'
  images: {
    alt?: string
    image: {
      $type: string
      mimeType: string
      ref: {
        $link: string
      }
      size: number
    }
  }[]
}

export type QuotedEmbeds = {
  $type: 'app.bsky.embed.record'
  record: {
    $type: 'app.bsky.embed.record#viewRecord'
    uri: string
    cid: string
    author: {
      did: string
      handle: string
      displayName?: string
    }
  }
}

export interface ExtendedRepoEntry extends RepoEntry {
  record: Post
  uri: string
}

export type LikedRecord = {
  $type: 'app.bsky.feed.like'
  createdAt: string
  subject: {
    cid: string
    uri: string
  }
}

export type LikedRecords = LikedRecord[]

export type ATRotationKeys = string[]
export type ATAlsoKnownAs = string[]
export type ATServices = Record<string, { type: string; endpoint: string }>
export type ATVerificationMethods = Record<string, string>

export interface PlcProfile {
  did: Did
  rotationKeys: ATRotationKeys
  alsoKnownAs: ATAlsoKnownAs
  services: ATServices
  verificationMethods: ATVerificationMethods
}

export interface BskyProfile {
  did: Did
  handle: string
  displayName?: string
  avatar?: string
}

export type ProfileData = PlcProfile & BskyProfile

export type PaginatedResult<T> = {
  count: number
  results: T[]
  next?: string | null
  prev?: string | null
}

export type PaginatedResultParams = {
  limit?: number
  page?: number
}
