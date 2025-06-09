import { Agent } from '@atproto/api'
import { isDid, isDidPlc } from '@atproto/oauth-client-node'

import { createClient } from '@/lib/atproto'
import { getSession } from '@/lib/sessions'

import CallbackPage from './CallbackPage'

async function CallbackServerPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // @ts-expect-error TS doesn't believe URLSearchParams can handle this
  const searchParamEntries = new URLSearchParams(await searchParams)
  const { did: account } = await getSession()

  if (!account) throw new Error('not authorized')
  if (!isDid(account))
    throw new Error(`Account must be a DID, but got: ${account}`)

  const client = await createClient({ account })
  const { session } = await client.callback(searchParamEntries)
  const agent = new Agent(session)

  if (!isDidPlc(agent.did)) throw new Error('Did not find PLC DID for current session.')

  return <CallbackPage plcDid={agent.did} />
}

export default CallbackServerPage
