'use client'

import { Account, Client, useAuthenticator } from '@storacha/ui-react'
import { styled } from 'next-yak'
import { ReactNode, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'

import { BackupDetail } from '@/components/BackupScreen/BackupDetail'
import { Center, Stack, Text } from '@/components/ui'
import { CreateButton } from '@/components/ui/CreateButton'
import { useMobileScreens } from '@/hooks/use-mobile-screens'
import { atproto } from '@/lib/capabilities'
import { SERVER_DID } from '@/lib/constants'
import { delegate } from '@/lib/delegate'
import { uploadCAR } from '@/lib/storacha'
import { SpaceDid } from '@/types'

import { BackupScreen } from '../components/BackupScreen'
import { useSWR } from '../lib/swr'

import { AppLayout } from './AppLayout'

let createNewBackup: typeof import('./backups/new/createNewBackup').action

if (process.env.STORYBOOK) {
  createNewBackup = () => {
    throw new Error('Server Functions are not available in Storybook')
  }
} else {
  createNewBackup = (await import('./backups/new/createNewBackup')).action
}

const Outside = styled(Stack)`
  min-height: 100vh;
  align-items: stretch;
`

async function createSession(client: Client, account: Account) {
  const issuer = client.agent.issuer

  const delegation = await atproto.delegate({
    issuer: issuer,
    audience: { did: () => SERVER_DID },
    with: account.did(),
    proofs: client.proofs([{ can: atproto.can, with: account.did() }]),
  })
  const result = await delegation.archive()

  if (result.error) {
    throw result.error
  }
  const archivedDelegation = result.ok

  await fetch(`/session/create/${encodeURIComponent(account.did())}`, {
    method: 'POST',
    body: archivedDelegation,
  })
}

function NewBackupForm({
  account,
  children,
}: {
  account: Account
  children: ReactNode
}) {
  const [{ client }] = useAuthenticator()

  async function generateDelegationAndCreateNewBackup(formData: FormData) {
    formData.append('account', account.did())
    try {
      const space = formData.get('storacha_space') as SpaceDid | undefined

      if (!space) {
        console.error('space id not defined, cannot create delegation.')
        toast.error('Space ID not defined, cannot create delegation.')
        return
      }

      if (!client) {
        console.error('client not defined, cannot create delegation')
        toast.error('Client not defined, cannot create delegation.')
        return
      }

      await client.setCurrentSpace(space)
      // upload the delegation to Storacha so we can use it later

      // Create a delegation valid for a year of backups
      const delegationDuration = 1000 * 60 * 60 * 24 * 365
      const delegationCid = await uploadCAR(
        client,
        new Blob([
          await delegate(client, space, { duration: delegationDuration }),
        ])
      )
      formData.append('delegation_cid', delegationCid.toString())

      const result = await createNewBackup(formData)
      return result
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message === 'NEXT_REDIRECT'
            ? 'Backup created successfully! Redirecting...'
            : error.message
          : 'Unknown error'
      )
      console.error('Backup creation error:', error)
    }
  }

  return <form action={generateDelegationAndCreateNewBackup}>{children}</form>
}

const CreateBackupButton = () => {
  const { pending } = useFormStatus()

  return (
    <CreateButton $isLoading={pending} type="submit">
      Create Backup
    </CreateButton>
  )
}

export function LoggedIn() {
  const { isMobile } = useMobileScreens()
  const [{ accounts, client }] = useAuthenticator()
  const account = accounts[0]
  const { error: sessionDIDError, mutate } = useSWR(['api', '/session/did'])

  const [sessionCreationAttempted, setSessionCreationAttempted] =
    useState(false)

  useEffect(() => {
    // if the client & account are loaded, the session DID is erroring and we're
    // not currently creating a session, try to create one
    if (!sessionCreationAttempted && client && account && sessionDIDError) {
      ;(async () => {
        try {
          await createSession(client, account)
          await mutate()
        } finally {
          setSessionCreationAttempted(true)
        }
      })()
    }
  }, [sessionCreationAttempted, account, sessionDIDError, mutate, client])
  if (!account) return null
  return (
    <Outside $direction="row">
      <AppLayout selectedBackupId={null}>
        <BackupScreen
          selectedBackupId={null}
          rightPanelContent={
            <Center $height={isMobile ? '45vh' : '90vh'}>
              <Text $fontWeight="600">
                Press &quot;Create Backup&quot; to get started!
              </Text>
            </Center>
          }
        >
          <NewBackupForm account={account}>
            <BackupDetail />
            <CreateBackupButton />
          </NewBackupForm>
        </BackupScreen>
      </AppLayout>
    </Outside>
  )
}
