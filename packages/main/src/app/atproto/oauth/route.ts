import { getCloudflareContext } from '@opennextjs/cloudflare'
import { createClient } from 'bluesky-backup-app-atproto-client'

export async function POST(request: Request) {
  const atprotoClientUri = process.env.NEXT_PUBLIC_BLUESKY_CLIENT_URI

  if (!atprotoClientUri) {
    throw new Error('NEXT_PUBLIC_BLUESKY_CLIENT_URI must be provided')
  }

  const {
    env: { BLUESKY_AUTH_SESSION_STORE, BLUESKY_AUTH_STATE_STORE },
  } = getCloudflareContext()

  const formData = await request.formData()
  const handle = formData.get('handle')
  const account = formData.get('account')

  if (!handle || !(typeof handle === 'string')) {
    return new Response('Missing handle', { status: 400 })
  }

  if (!account || !(typeof account === 'string')) {
    return new Response('Missing account', { status: 400 })
  }

  const client = await createClient({
    atprotoClientUri,
    account,
    sessionStoreKV: BLUESKY_AUTH_SESSION_STORE,
    stateStoreKV: BLUESKY_AUTH_STATE_STORE,
  })
  const url = await client.authorize(handle)
  return Response.redirect(url)
}
