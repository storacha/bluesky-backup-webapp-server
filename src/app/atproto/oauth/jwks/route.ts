import { createClient } from '@/lib/atproto'

export async function GET () {
  const client = await createClient({ account: 'did:web:bsky.storage' })
  return Response.json(client.jwks)
}
