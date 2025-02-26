import { blueskyClientMetadata } from "@/lib/bluesky";

export const runtime = 'edge'

export async function GET() {
  return Response.json(blueskyClientMetadata)
}
