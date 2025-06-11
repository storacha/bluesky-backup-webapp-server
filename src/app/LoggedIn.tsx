'use client'

import { Account, Client, useAuthenticator } from '@storacha/ui-react'
import { useRouter } from 'next/navigation'
import { styled } from 'next-yak'
import { ReactNode, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'

import { BackupDetail } from '@/components/BackupScreen/BackupDetail'
import { FullscreenLoader } from '@/components/Loader'
import { Stack, Text } from '@/components/ui'
import { CreateButton } from '@/components/ui/CreateButton'
import { useBBAnalytics } from '@/hooks/use-bb-analytics'
import { useMobileScreens } from '@/hooks/use-mobile-screens'
import { usePlan, useStorachaAccount } from '@/hooks/use-plan'
import { atproto } from '@/lib/capabilities'
import { SERVER_DID } from '@/lib/constants'
import { delegate } from '@/lib/delegate'
import { uploadCAR } from '@/lib/storacha'
import { SpaceDid } from '@/types'

import { BackupScreen } from '../components/BackupScreen'
import { useSWR } from '../lib/swr'

import { AppLayout } from './AppLayout'
import { BackupExplainer } from './BackupExplainer'
import { PlanSelector } from '../components/PlanSelector'

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

async function createSession (client: Client, account: Account) {
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

function NewBackupForm ({
  account,
  children,
}: {
  account: Account
  children: ReactNode
}) {
  const [{ client }] = useAuthenticator()
  const { logBackupCreationSuccessful, logBackupCreationStarted } =
    useBBAnalytics()
  const router = useRouter()

  async function generateDelegationAndCreateNewBackup (formData: FormData) {
    logBackupCreationStarted({
      atprotoAccount: formData.get('atproto_account')?.toString(),
      includeBlobs: formData.get('include_blobs') === 'on',
      includeRepository: formData.get('include_repository') === 'on',
      spaceId: formData.get('storacha_space')?.toString(),
      userId: account.did(),
    })
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
      const delegationDuration = 60 * 60 * 24 * 365
      const { carCid: delegationCid } = await uploadCAR(
        client,
        new Blob([
          await delegate(client, space, { duration: delegationDuration }),
        ])
      )
      formData.append('delegation_cid', delegationCid.toString())

      const result = await createNewBackup(formData)
      if (result) {
        logBackupCreationSuccessful({
          atprotoAccount: result.atprotoAccount,
          includeBlobs: result.includeBlobs,
          includeRepository: result.includeRepository,
          spaceId: result.storachaSpace,
          userId: result.accountDid,
        })
        toast.success('Backup created!')
        router.push(`/backups/${result.id}`)
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message === 'NEXT_REDIRECT'
            ? 'Backup created!'
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
    <CreateButton $isLoading={pending} type="submit" $mt="1.4rem">
      Create Backup
    </CreateButton>
  )
}

const ExplainerContainer = styled.div`
  margin-top: 3em;
  margin-bottom: 1em;
  padding-bottom: 1.5em;
  border-bottom: 1px solid var(--color-gray-medium);
`

const CreateBackupText = styled(Text)`
  margin-top: 1em;
`

export function LoggedIn () {
  const { isSmallViewPort } = useMobileScreens()
  const [{ client }] = useAuthenticator()
  const account = useStorachaAccount()
  const { error: sessionDIDError, mutate } = useSWR(['api', '/session/did'])
  const { logLoginSuccessful } = useBBAnalytics()
  const { data: backups, isLoading: areBackupsLoading } = useSWR([
    'api',
    '/api/backups',
  ])
  const areThereBackups = !areBackupsLoading && backups && backups.length > 0
  const [sessionCreationAttempted, setSessionCreationAttempted] =
    useState(false)
  const { data: plan, isLoading: planIsLoading } = usePlan(account)
  useEffect(() => {
    // if the client & account are loaded, the session DID is erroring and we're
    // not currently creating a session, try to create one
    if (!sessionCreationAttempted && client && account && sessionDIDError) {
      ; (async () => {
        try {
          await createSession(client, account)
          await mutate()
          logLoginSuccessful({ method: 'email' })
        } finally {
          setSessionCreationAttempted(true)
        }
      })()
    }
  }, [
    sessionCreationAttempted,
    account,
    sessionDIDError,
    mutate,
    client,
    logLoginSuccessful,
  ])
  if (!account) return null
  return (
    <Outside $direction="row">
      <AppLayout selectedBackupId={null}>
        {planIsLoading ? (
          <FullscreenLoader />
        ) : plan ? (
          <BackupScreen
            selectedBackupId={null}
            rightPanelContent={
              <CreateBackupText>
                Create a backup to see details.
              </CreateBackupText>
            }
          >
            <Stack>
              {isSmallViewPort && !areThereBackups && (
                <ExplainerContainer>
                  <BackupExplainer />
                </ExplainerContainer>
              )}
              <NewBackupForm account={account}>
                <BackupDetail />
                <CreateBackupButton />
              </NewBackupForm>
            </Stack>
          </BackupScreen>
        ) : (
          <PlanSelector />
        )}
      </AppLayout>
    </Outside>
  )
}
