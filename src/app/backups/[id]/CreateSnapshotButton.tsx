'use client'

import { useAuthenticator } from '@storacha/ui-react'
import { useEffect, useState } from 'react'

import { CreateButton } from '@/components/ui/CreateButton'
import { delegate } from '@/lib/delegate'
import { useSWRMutation } from '@/lib/swr'
import { Backup } from '@/types'

export const CreateSnapshotButton = ({ backup }: { backup: Backup }) => {
  const [{ accounts, client }] = useAuthenticator()
  const account = accounts[0]
  const [createSnapshot, setCreateSnapshot] = useState<
    typeof import('./createSnapshot').createSnapshot | null
  >(null)

  useEffect(() => {
    if (process.env.STORYBOOK) {
      return
    }

    const importCreateSnapshot = async () => {
      const { createSnapshot } = await import('./createSnapshot')
      setCreateSnapshot(createSnapshot)
    }
    importCreateSnapshot()
  }, [])

  const enabled = client && backup
  const { trigger, isMutating } = useSWRMutation(
    enabled && ['api', `/api/backups/${backup.id}/snapshots`],
    async () => {
      const delegationData = await delegate(client!, backup.storachaSpace)
      await createSnapshot?.({ backupId: backup.id, delegationData })
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
      $isLoading={isMutating}
    >
      Create Snapshot
    </CreateButton>
  )
}
