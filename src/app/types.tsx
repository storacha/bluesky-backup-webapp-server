import { Did } from '@atproto/oauth-client-node'

export type Backup = {
  id: number
  accountDid: string
  name: string
  atprotoAccount: Did
  storachaSpace: Did<'key'>
  includeRepository: boolean
  includeBlobs: boolean
  includePreferences: boolean
}

type Input<
  T,
  NoInput extends keyof T,
  OptionalInput extends keyof T = never,
> = Omit<Omit<T, NoInput>, OptionalInput> &
  Partial<Omit<Pick<T, OptionalInput>, NoInput>>

export type BackupInput = Input<Backup, 'id'>

export type SnapshotStatus = 'not-started' | 'in-progress' | 'failed' | 'success'

export type Snapshot = {
  id: number
  atprotoAccount: Did
  backupId: number
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
  cid: string
  contentType?: string
  snapshotId: number
  backupId?: number
  createdAt: string
}

export type ATBlobInput = Input<ATBlob, 'createdAt'>
