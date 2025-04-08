export type BackupConfig = {
  id: number
  name: string
  bluesky_account: string
  storacha_space: string
  include_repository: boolean
  include_blobs: boolean
  include_preferences: boolean
}

export type Backup = {
  id: number
  backup_configs_id: number
  repository_cid: string
  blobs_cid: string
  preferences_cid: string
  created_at: string
}
