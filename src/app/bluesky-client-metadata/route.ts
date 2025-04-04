import { blueskyClientMetadata } from '@/lib/bluesky'

export async function GET() {
  return Response.json(blueskyClientMetadata)
}
