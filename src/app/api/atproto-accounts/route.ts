import { findAuthedBskyAccounts } from '@/lib/atproto'
import { getStorageContext } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

export async function GET() {
  const { authSessionStore } = getStorageContext()

  const { did: account } = await getSession()
  if (!account) {
    return new Response('Not authorized', { status: 401 })
  }

  return Response.json(await findAuthedBskyAccounts(authSessionStore, account))
}
