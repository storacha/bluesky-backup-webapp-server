'use client'

import { Backup } from '@/app/types'
import { Button } from '@/components/ui'
import { useAuthenticator } from '@storacha/ui-react'
import { createSnapshot } from './createSnapshot'
import { delegate } from './delegate'
import { useSWRMutation } from '@/app/swr'

export const CreateSnapshotButton = ({
  backup,
}: {
  backup: Backup | undefined
}) => {
  const [{ accounts, client }] = useAuthenticator()
  const account = accounts[0]

  const enabled = backup && client

  const { trigger } = useSWRMutation(
    enabled && ['api', '/api/backups'],
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
    <Button
      $background={
        enabled ? 'var(--color-dark-blue)' : 'var(--color-gray-medium)'
      }
      $color="var(--color-white)"
      $textTransform="capitalize"
      $width="fit-content"
      $fontSize="0.75rem"
      $mt="1.4rem"
      onClick={
        enabled &&
        (() => {
          trigger()
        })
      }
      disabled={!enabled}
    >
      create snapshot
    </Button>
  )
}
