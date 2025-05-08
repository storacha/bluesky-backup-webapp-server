import { blueskyClientMetadata } from '@/lib/atproto'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ account: string }> }
) {
  const { account } = await params
  return Response.json(await blueskyClientMetadata({ account }))
}
