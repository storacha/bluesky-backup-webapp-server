import { WorkerEntrypoint } from 'cloudflare:workers'
import type { BackupDO } from './BackupDO'
import type { DID } from '@ucanto/interface'
import { ClickableDurableObjectStub } from '../ClickableDurableObjectStub'

export { BackupDO } from './BackupDO'

export default class DurableObjectsWorker extends WorkerEntrypoint<CloudflareEnv> {
  async fetch() {
    return new Response('Hello World!')
  }

  async beginBackup({
    rowId,
    account,
    atpDid,
    storachaSpaceDid,
  }: {
    rowId: string
    account: string
    atpDid: DID
    storachaSpaceDid: DID<'key'>
  }) {
    const { BACKUP_DO } = this.env
    const id = BACKUP_DO.idFromName(rowId)
    const stub = BACKUP_DO.get(id) as ClickableDurableObjectStub<BackupDO>

    stub.begin({
      account,
      atpDid,
      storachaSpaceDid,
    })
  }
}
