import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

export async function GET() {
  const { authSessionStore } = getStorageContext()

  const { did: account } = await getSession()
  if (!account) {
    return new Response('Not authorized', { status: 401 })
  }

  const keysResult = await authSessionStore.list({
    prefix: `${account}!`,
  })

  return Response.json(keysResult.keys.map((key) => key.name.split('!')[1]))
}
