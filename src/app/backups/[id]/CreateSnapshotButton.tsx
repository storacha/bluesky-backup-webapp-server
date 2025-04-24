'use client'

import { Backup } from '@/app/types'
import { useAuthenticator } from '@storacha/ui-react'
import { createSnapshot } from './createSnapshot'
import { delegate } from './delegate'
import { useSWRMutation } from '@/app/swr'
import { CreateButton } from '@/components/ui/CreateButton'

export const CreateSnapshotButton = ({ backup }: { backup: Backup }) => {
  const [{ accounts, client }] = useAuthenticator()
  const account = accounts[0]

  const enabled = client && backup

  const { trigger } = useSWRMutation(
    enabled && ['api', `/api/backups/${backup.id}/snapshots`],
    async () => {
      // SWR guarantees this won't actually happen.
      if (!enabled)
        throw new Error('Mutation ran but key should have been null')
      const delegationData = await delegate(client, backup.storachaSpace)
      await createSnapshot({ backupId: backup.id, delegationData })
    }
  )

  if (!account || !client) {
    return null
  }

  return (
    <CreateButton
      onClick={
        enabled &&
        (() => {
          trigger()
        })
      }
    >
      create snapshot
    </CreateButton>
  )
}
