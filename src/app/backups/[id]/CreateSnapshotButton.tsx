'use client'

import { Backup } from '@/app/types'
import { Button } from '@/components/ui'
import { useAuthenticator } from '@storacha/ui-react'
import { createSnapshot } from './createSnapshot'
import { delegate } from './delegate'

export const CreateSnapshotButton = ({
  backup,
  mutateBackups,
}: {
  backup: Backup
  mutateBackups: () => void
}) => {
  const [{ accounts, client }] = useAuthenticator()
  const account = accounts[0]
  if (!account || !client) {
    return null
  }

  const handleClick = async () => {
    const delegationData = await delegate(client, backup.storachaSpace)
    await createSnapshot({ backupId: backup.id, delegationData })
    mutateBackups()
  }

  return (
    <Button
      $background="var(--color-dark-blue)"
      $color="var(--color-white)"
      $textTransform="capitalize"
      $width="fit-content"
      $fontSize="0.75rem"
      $mt="1.4rem"
      onClick={handleClick}
    >
      create snapshot
    </Button>
  )
}
