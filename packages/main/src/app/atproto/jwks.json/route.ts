import { getCloudflareContext } from '@opennextjs/cloudflare'
import { createClient } from 'bluesky-backup-app-atproto-client'
import { isDid } from '@atproto/oauth-client-node'
import { getSession } from '@/lib/sessions'

export async function GET() {
  const atprotoClientUri = process.env.NEXT_PUBLIC_BLUESKY_CLIENT_URI
  if (!atprotoClientUri) {
    throw new Error('NEXT_PUBLIC_BLUESKY_CLIENT_URI must be provided')
  }

  const {
    env: { BLUESKY_AUTH_SESSION_STORE, BLUESKY_AUTH_STATE_STORE },
  } = getCloudflareContext()
  const { did: account } = await getSession()
  if (!account) {
    return new Response(`Not authorized`, {
      status: 401,
    })
  }
  if (!isDid(account)) {
    return new Response(`Account must be a DID, but got: ${account}`, {
      status: 400,
    })
  }
  const client = await createClient({
    atprotoClientUri,
    account,
    sessionStoreKV: BLUESKY_AUTH_SESSION_STORE,
    stateStoreKV: BLUESKY_AUTH_STATE_STORE,
  })

  return Response.json(client.jwks)
}
