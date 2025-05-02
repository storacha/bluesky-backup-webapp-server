'use client'

import { useAuthenticator } from '@storacha/ui-react'

import { useSWRMutation } from '@/app/swr'
import { Backup } from '@/app/types'
import { Spinner } from '@/components/ui'
import { CreateButton } from '@/components/ui/CreateButton'
import { delegate } from '@/lib/delegate'

let createSnapshot: typeof import('./createSnapshot').createSnapshot

if (process.env.STORYBOOK) {
  createSnapshot = () => {
    throw new Error('Server Functions are not available in Storybook')
  }
} else {
  createSnapshot = (await import('./createSnapshot')).createSnapshot
}

export const CreateSnapshotButton = ({ backup }: { backup: Backup }) => {
  const [{ accounts, client }] = useAuthenticator()
  const account = accounts[0]

  const enabled = client && backup
  const { trigger, isMutating } = useSWRMutation(
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

  return isMutating ? (
    <Spinner />
  ) : (
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
