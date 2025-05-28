'use client'

import { styled } from 'next-yak'

import { Sidebar } from '@/app/Sidebar'
import { Heading, Stack } from '@/components/ui'
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

const IdentitiesLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-4 p-4">
    <h1 className="text-2xl font-bold">Identities</h1>
    {children}
  </div>
)

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
      <IdentitiesLayout>
        <div className="text-red-500">Error loading identities: {error.message}</div>
      </IdentitiesLayout>
    )
  }

  return (
    <IdentitiesLayout>
      <Sidebar selectedBackupId={null} />
      <IdentitiesStack $gap="1rem">
        <Heading>Bluesky Identities</Heading>
        {identities?.map((identity) => (
          <IdentityCard key={identity.id} identity={identity} />
        ))}
      </IdentitiesStack>
    </IdentitiesLayout>
  )
}
