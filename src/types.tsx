import { RepoEntry } from '@atcute/car'
import { Did } from '@atproto/api'
import { Secp256k1Keypair } from '@atproto/crypto'

export type SpaceDid = `did:key:${string}`

export type Backup = {
  id: string
  accountDid: string
  name: string
  atprotoAccount: Did
  storachaSpace: SpaceDid
  includeRepository: boolean
  includeBlobs: boolean
  includePreferences: boolean
  delegationCid: string | null
}

type Input<
  T,
  NoInput extends keyof T,
  OptionalInput extends keyof T = never,
> = Omit<Omit<T, NoInput>, OptionalInput> &
  Partial<Omit<Pick<T, OptionalInput>, NoInput>>

export type BackupInput = Input<Backup, 'id'>

type SnapshotStatus = 'not-started' | 'in-progress' | 'failed' | 'success'

export type Snapshot = {
  id: string
  atprotoAccount: Did
  backupId: string
  repositoryStatus: SnapshotStatus
  repositoryCid?: string
  blobsStatus: SnapshotStatus
  preferencesStatus: SnapshotStatus
  preferencesCid?: string
  createdAt: string
}

export type SnapshotInput = Input<
  Snapshot,
  'id' | 'createdAt',
  | 'repositoryStatus'
  | 'repositoryCid'
  | 'blobsStatus'
  | 'preferencesStatus'
  | 'preferencesCid'
>

export type State = 'loading' | 'idle'

export interface ATBlob {
  id: string
  cid: string
  contentType?: string
  snapshotId: string
  backupId?: string
  createdAt: string
}

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

export interface PlcProfile {
  did: Did
  rotationKeys: string[]
  alsoKnownAs: string[]
  services: {
    atproto_pds: {
      endpoint: string
      type: string
    }
  }
  verificationMethods: Record<string, unknown>
}

export interface BskyProfile {
  did: Did
  handle: string
  displayName: string
}

export type ProfileData = PlcProfile & BskyProfile

export type ATBlobInput = Input<ATBlob, 'id' | 'createdAt'>

export interface RotationKey {
  id: string
  keypair?: Secp256k1Keypair
  storachaAccount: string
  atprotoAccount: string
  createdAt: string
}

export type RotationKeyInput = Input<RotationKey, 'createdAt' | 'keypair'>

export type RotationKeyClientInput = Input<RotationKeyInput, 'storachaAccount'>
