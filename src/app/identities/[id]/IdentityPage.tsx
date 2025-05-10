'use client'

import { Did } from '@atproto/api'
import { styled } from 'next-yak'

import { Sidebar } from '@/app/Sidebar'
import { Heading, NoTextTransform, Stack, SubHeading } from '@/components/ui'
import Keychain from '@/components/ui/Keychain'
import { useProfile } from '@/hooks/use-profile'

const IdentityStack = styled(Stack)`
  padding: 2rem;
  width: 100%;
`

export default function IdentityPage({ atprotoDid }: { atprotoDid: Did }) {
  const { data: profile } = useProfile(atprotoDid)
  return (
    <>
      <Sidebar selectedBackupId={null} />
      <IdentityStack $gap="1rem">
        <Heading>
          Bluesky Account <NoTextTransform>{profile?.handle}</NoTextTransform>
        </Heading>
        <SubHeading>
          <NoTextTransform>{atprotoDid}</NoTextTransform>
        </SubHeading>
        <Keychain atprotoAccount={atprotoDid} />
      </IdentityStack>
    </>
  )
}
