'use client'

import { styled } from 'next-yak'
import useSWR, { SWRResponse } from 'swr'

import { BackButton } from '@/components/BackButton'
import { Button, Heading, Stack, Text } from '@/components/ui'
import { Identity } from '@/types'

import { AppLayout } from '../AppLayout'

import { IdentityCard } from './components/IdentityCard'

const IdentitiesStack = styled(Stack)`
  padding: 2rem;
  width: 50%;

  @media only screen and (min-width: 0px) and (max-width: 600px) {
    width: 100%;
  }

  @media only screen and (min-width: 601px) and (max-width: 992px) {
    width: 55%;
  }
`

export default function IdentitiesPage({
  identities: initialIdentities,
}: {
  identities: Identity[]
}) {
  const connectNewAccount = () => {
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    window.open(
      '/atproto/connect',
      'atproto-connect',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    )
  }

  const { data: identities, error }: SWRResponse<Identity[] | undefined> =
    useSWR(['api', '/api/identities'], {
      fallbackData: initialIdentities,
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 0,
    })

  if (error) {
    return <Text>Error loading identities: {error.message}</Text>
  }

  return (
    <AppLayout selectedBackupId={null}>
      <IdentitiesStack $gap="1rem">
        <Stack $alignItems="center" $direction="row" $gap="1rem">
          <BackButton path="/" />
          <Heading>Bluesky Identities</Heading>
        </Stack>
        {identities?.map((identity) => (
          <IdentityCard key={identity.id} identity={identity as Identity} />
        ))}
        <Button
          $width="fit-content"
          $fontSize="0.875rem"
          onClick={connectNewAccount}
        >
          Connect new account
        </Button>
      </IdentitiesStack>
    </AppLayout>
  )
}
