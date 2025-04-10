import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getSession } from '@/lib/sessions'

export async function GET() {
  const {
    env: { BLUESKY_AUTH_SESSION_STORE },
  } = getCloudflareContext()

  const { did: account } = await getSession()
  if (!account) {
    return new Response('Not authorized', { status: 401 })
  }

  const keysResult = await BLUESKY_AUTH_SESSION_STORE.list({
    prefix: `${account}!`,
  })

  return Response.json(keysResult.keys.map((key) => key.name.split('!')[1]))
}
