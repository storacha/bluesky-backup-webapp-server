'use client'

import { Did } from '@atproto/api'
import { useEffect } from 'react'

import { useBBAnalytics } from '@/hooks/use-bb-analytics'
import { useStorachaAccount } from '@/hooks/use-plan'
import { useProfile } from '@/hooks/use-profile'
import { Loader } from '@/components/Loader'
import { Stack } from '@/components/ui'

export default function CallbackPage ({ plcDid }: { plcDid: Did }) {
  const account = useStorachaAccount()
  const userId = account?.did()

  const { logBlueskyLoginSuccessful } = useBBAnalytics()
  const { data: profile } = useProfile(plcDid)
  const handle = profile?.handle

  useEffect(
    function () {
      if (logBlueskyLoginSuccessful && userId && handle) {
        logBlueskyLoginSuccessful({
          userId,
          handle,
        })
        window.close()
      }
    },
    [logBlueskyLoginSuccessful, userId, handle]
  )

  return (
    <Stack $justifyContent='center' $alignItems='center' $width='100vh' $height='100vh'>
      <Loader />
    </Stack>
  )
}
