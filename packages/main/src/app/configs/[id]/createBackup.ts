'use server'

import { getCloudflareContext } from '@opennextjs/cloudflare'
import type DurableObjectsWorker from '../../../../.durable-objects/durable-objects'
import { BackupConfig } from '@/app/types'

// TODO: Needs authorization.

export const createBackup = async ({
  configId,
  account,
}: {
  configId: number
  // TODO: Temporary until real auth is in place
  account: string
}) => {
  const { env } = getCloudflareContext()
  const DB = env.DB
  const DURABLE_OBJECTS_WORKER =
    env.DURABLE_OBJECTS_WORKER as Fetcher<DurableObjectsWorker>

  const backupConfig = await DB.prepare(
    /* sql */ `
    SELECT
      id,
      atproto_account,
      storacha_space,
      include_repository,
      include_blobs,
      include_preferences
    FROM backup_configs
    WHERE
     account_did = ?,
     id = ?
  `
  )
    .bind(account, configId)
    .first<BackupConfig>()
  if (!backupConfig) {
    throw new Error('Backup config not found')
  }
  const { atproto_account: atpDid, storacha_space: storachaSpaceDid } =
    backupConfig

  const backup = await DB.prepare(
    /* sql */ `
      INSERT INTO backups (
        backup_config_id,
      )
      VALUES(?, ?, ?, ?)
      RETURNING id
    `
  )
    .bind(configId)
    .first<Pick<BackupConfig, 'id'>>()

  if (!backup) {
    throw new Error('Failed to create backup')
  }

  await DURABLE_OBJECTS_WORKER.beginBackup({
    rowId: backup.id.toString(),
    account,
    atpDid,
    storachaSpaceDid,
  })

  // console.log(
  //   'durable object response',
  //   doResponse2,
  //   typeof doResponse2,
  //   doResponse2.constructor
  // )
}
