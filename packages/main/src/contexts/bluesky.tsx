'use client'

import { Agent } from '@atproto/api'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { OAuthSession, BrowserOAuthClient } from '@atproto/oauth-client-browser'

import { createContext, useContext } from 'react'

export type BskyAuthContextProps = {
  initialized: boolean
  authenticated: boolean
  session?: OAuthSession
  state?: string
  userProfile?: ProfileViewDetailed
  bskyAuthClient?: BrowserOAuthClient
  agent?: Agent
}

export const BskyAuthContext = createContext<BskyAuthContextProps>({
  initialized: false,
  authenticated: false,
})

export const useBskyAuthContext = () => {
  return useContext(BskyAuthContext)
}
