import { Did } from '@atproto/oauth-client-node'

export type SpaceDid = Did<'key'>

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

export interface ATBlob {
  id: string
  cid: string
  contentType?: string
  snapshotId: string
  backupId?: string
  createdAt: string
}

export type ATBlobInput = Input<ATBlob, 'id' | 'createdAt'>
