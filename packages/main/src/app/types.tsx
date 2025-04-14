import { Did } from '@atproto/oauth-client-node'

export type BackupConfig = {
  id: number
  name: string
  atproto_account: Did
  storacha_space: Did<'key'>
  include_repository: boolean
  include_blobs: boolean
  include_preferences: boolean
}

export type BackupStatus = 'not-started' | 'in-progress' | 'failed' | 'success'

export type Backup = {
  id: number
  backup_config_id: number
  repository_status: BackupStatus
  repository_cid: string
  blobs_status: BackupStatus
  blobs_cid: string
  preferences_status: BackupStatus
  preferences_cid: string
  created_at: string
}
