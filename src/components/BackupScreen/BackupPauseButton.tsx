'use client'

import { Pause } from '@phosphor-icons/react'
import { styled } from 'next-yak'
import { toast } from 'sonner'

import { Button, Spinner, Stack, Text } from '@/components/ui'
import { useSWRMutation } from '@/lib/swr'
import { Backup } from '@/types'

const BlockSpinner = styled(Spinner)`
  display: block;
`

export const BackupPauseButton = ({ backup }: { backup: Backup }) => {
  const { trigger, isMutating } = useSWRMutation(
    ['api', '/api/backups'],
    async (_key, { arg: { newPaused } }: { arg: { newPaused: boolean } }) => {
      const response = await fetch(`/api/backups/${backup.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paused: newPaused }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${newPaused ? 'pause' : 'resume'} backup`)
      }

      toast.success(`Backup ${newPaused ? 'paused' : 'resumed'}`)
    }
  )

  return (
    <Stack $direction="row" $gap="0.5rem" $alignItems="center">
      {backup.paused && (
        <Text $color="var(--color-dark-red)" $lineHeight="1">
          Paused
        </Text>
      )}
      <Button
        $px="0.25rem"
        $py="0.25rem"
        $borderRadius="0.5rem"
        onClick={() => {
          trigger({ newPaused: !backup.paused })
        }}
        disabled={isMutating}
        {...(backup.paused
          ? {
              $background: 'var(--color-dark-red)',
              $color: 'var(--color-white)',
              title: 'Resume backup',
              'aria-label': 'Resume backup',
            }
          : {
              $background: 'var(--color-gray-light)',
              $color: 'var(--color-gray-medium)',
              title: 'Pause backup',
              'aria-label': 'Pause backup',
            })}
      >
        {isMutating ? (
          <BlockSpinner />
        ) : (
          <Pause weight="fill" size="1rem" display="block" />
        )}
      </Button>
    </Stack>
  )
}
