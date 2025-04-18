import { Did } from '@atproto/oauth-client-node'

export type BackupConfig = {
  id: number
  account_did: string
  name: string
  atproto_account: Did
  storacha_space: Did<'key'>
  include_repository: boolean
  include_blobs: boolean
  include_preferences: boolean
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
  backup_config_id: number
  repository_status: BackupStatus
  repository_cid: string | null
  blobs_status: BackupStatus
  blobs_cid: string | null
  preferences_status: BackupStatus
  preferences_cid: string | null
  created_at: string
}

export type BackupInput = Input<
  Backup,
  'id' | 'created_at',
  | 'repository_status'
  | 'repository_cid'
  | 'blobs_status'
  | 'blobs_cid'
  | 'preferences_status'
  | 'preferences_cid'
>
