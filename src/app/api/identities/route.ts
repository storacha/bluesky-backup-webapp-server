import { findAllIdentities } from '@/lib/atproto'
import { getSession } from '@/lib/sessions'

export async function GET() {
  const { did: account } = await getSession()
  if (!account) {
    return new Response('Not authorized', { status: 401 })
  }

  const identities = await findAllIdentities()
  return new Response(JSON.stringify(identities), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
} 