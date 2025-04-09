'use client'
export type BackupConfig = {
  id: number
  name: string
  bluesky_account: string
  storacha_space: string
  include_repository: boolean
  include_blobs: boolean
  include_preferences: boolean
}
