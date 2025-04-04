import { NextRequest } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// NEEDS UCAN AUTHORIZATION

export async function GET(request: NextRequest) {
  const {
    env: { BLUESKY_AUTH_SESSION_STORE },
  } = getCloudflareContext()

  const { searchParams } = request.nextUrl
  const account = searchParams.get('account')
  if (!account) {
    return new Response('Missing account', { status: 400 })
  }

  const keysResult = await BLUESKY_AUTH_SESSION_STORE.list({
    prefix: `${account}!`,
  })

  return Response.json(keysResult.keys.map((key) => key.name.split('!')[1]))
}
