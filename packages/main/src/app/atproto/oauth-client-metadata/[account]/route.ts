import { blueskyClientMetadata } from '../../client'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ account: string }> }
) {
  const { account } = await params
  return Response.json(blueskyClientMetadata({ account }))
}
