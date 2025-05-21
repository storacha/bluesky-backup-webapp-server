'use client'

import { styled } from 'next-yak'

import { Sidebar } from '@/app/Sidebar'
import { Heading, Stack, Text } from '@/components/ui'
import { useSWR } from '@/lib/swr'
import { Backup } from '@/types'
import { IdentityCard } from './components/IdentityCard'

const IdentitiesStack = styled(Stack)`
  padding: 2rem;
  width: 100%;
`

type Identity = Backup & {
  isConnected: boolean
}

export default function IdentitiesPage({
  identities: initialIdentities,
}: {
  identities: Identity[]
}) {
  const { data: identities, error } = useSWR(['api', '/api/identities'], {
    fallbackData: initialIdentities,
    revalidateOnFocus: false,
    revalidateOnMount: true,
    dedupingInterval: 0,
  })

  if (error) {
    return (
      <>
        <Sidebar selectedBackupId={null} />
        <IdentitiesStack $gap="1rem">
          <Heading>Error loading identities</Heading>
          <Text>Please try refreshing the page</Text>
        </IdentitiesStack>
      </>
    )
  }

  return (
    <>
      <Sidebar selectedBackupId={null} />
      <IdentitiesStack $gap="1rem">
        <Heading>Bluesky Identities</Heading>
        {identities?.map((identity) => (
          <IdentityCard key={identity.id} identity={identity} />
        ))}
      </IdentitiesStack>
    </>
  )
}
