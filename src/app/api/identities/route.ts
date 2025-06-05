import { findAllIdentities } from '@/lib/atproto'
import { getSession } from '@/lib/sessions'

export async function GET() {
  const { did: account } = await getSession()
  if (!account) {
    return new Response('Not authorized', { status: 401 })
  }

  const identities = await findAllIdentities()

  // Cache for 200ms to reduce server load while maintaining reasonable freshness
  // The request involves multiple DB queries and JS-space deduplication
  return new Response(JSON.stringify(identities), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'max-age=0.2, must-revalidate',
    },
  })
}
