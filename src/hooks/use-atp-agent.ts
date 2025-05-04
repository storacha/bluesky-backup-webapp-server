import AtpAgent, { CredentialSession } from '@atproto/api'
import { useRef } from 'react'

export const useAtpAgent = () => {
  const agentRef = useRef<AtpAgent | null>(null)
  if (!agentRef.current) {
    const session = new CredentialSession(new URL('https://bsky.social'))
    agentRef.current = new AtpAgent(session)
  }
  return agentRef.current
}
