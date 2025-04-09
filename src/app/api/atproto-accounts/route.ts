import { NextRequest } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSession } from '@/lib/sessions'

export async function GET (request: NextRequest) {
  const {
    env: { BLUESKY_AUTH_SESSION_STORE },
  } = getCloudflareContext()

  const { searchParams } = request.nextUrl
  const account = searchParams.get('account')
  if (!account) {
    return new Response('Missing account', { status: 400 })
  }
  const { did } = await getSession()
  if (did !== account){
    return new Response('Not authorized', { status: 401 })
  }

  const keysResult = await BLUESKY_AUTH_SESSION_STORE.list({
    prefix: `${account}!`,
  })

  return Response.json(keysResult.keys.map((key) => key.name.split('!')[1]))
}
