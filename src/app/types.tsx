import { Did } from '@atproto/oauth-client-node'

export type BackupConfig = {
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

export type BackupConfigInput = Input<BackupConfig, 'id'>

export type BackupStatus = 'not-started' | 'in-progress' | 'failed' | 'success'

export type Backup = {
  id: number
  backupConfigId: number
  repositoryStatus: BackupStatus
  repositoryCid?: string
  blobsStatus: BackupStatus
  preferencesStatus: BackupStatus
  preferencesCid?: string
  createdAt: string
}

export type BackupInput = Input<
  Backup,
  'id' | 'createdAt',
  | 'repositoryStatus'
  | 'repositoryCid'
  | 'blobsStatus'
  | 'preferencesStatus'
  | 'preferencesCid'
>

export interface ATBlob {
  cid: string
  backupId: number
  backupConfigId?: number
  createdAt: string
}

export type ATBlobInput = Input<ATBlob, 'createdAt'>
