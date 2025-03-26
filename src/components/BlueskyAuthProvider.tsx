'use client'

import { BskyAuthContext } from '@/contexts'
import { blueskyClientMetadata } from '@/lib/bluesky'
import { Agent } from '@atproto/api'
import { OAuthSession, BrowserOAuthClient } from '@atproto/oauth-client-browser'
import { useQuery } from '@tanstack/react-query'
import { JSX, ReactNode, useEffect, useMemo, useState } from 'react'

type Props = {
  children: JSX.Element | JSX.Element[] | ReactNode
}
export const BskyAuthProvider = ({ children }: Props) => {
  const [authenticated, setAuthenticated] = useState<boolean>(false)
  const [bskyAuthClient, setBskyAuthClient] = useState<BrowserOAuthClient>()
  const [session, setSession] = useState<OAuthSession>()
  const [state, setState] = useState<string>()
  const [initialized, setInitialized] = useState(false)

  const bskyAgent = useMemo(() => {
    if (!authenticated || !session) return
    return new Agent(session)
  }, [authenticated, session])

  const { data: userProfile } = useQuery({
    queryKey: ['bsky', 'profile'],
    queryFn: async () => {
      if (!authenticated || !bskyAgent || !bskyAgent.did) return
      const result = (await bskyAgent.getProfile({ actor: bskyAgent.did })).data
      return result
    },
    enabled: authenticated && !!bskyAgent,
  })

  useEffect(() => {
    const initBsky = async () => {
      const bskyAuthClient = new BrowserOAuthClient({
        clientMetadata: blueskyClientMetadata,
        handleResolver: 'https://bsky.social',
      })
      setBskyAuthClient(bskyAuthClient)

      const result = await bskyAuthClient.init(true)

      if (result) {
        const { session, state } = result as {
          session: OAuthSession
          state: string | null
        }

        if (state != null) {
          console.log(
            `${session.sub} was successfully authenticated (state: ${state})`
          )
          setAuthenticated(true)
          setSession(session)
          setState(state)
        } else {
          console.log(`${session.sub} was restored (last active session)`)

          setAuthenticated(true)
          setSession(session)
        }
      }
      setInitialized(true)
    }

    initBsky()
  }, [])

  return (
    <BskyAuthContext.Provider
      value={{
        initialized,
        authenticated,
        session,
        state,
        userProfile,
        bskyAuthClient,
        agent: bskyAgent,
      }}
    >
      {children}
    </BskyAuthContext.Provider>
  )
}

export default BskyAuthProvider
