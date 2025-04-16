import { clientMetadata } from 'bluesky-backup-app-atproto-client'

export async function GET() {
  const atprotoClientUri = process.env.NEXT_PUBLIC_BLUESKY_CLIENT_URI

  if (!atprotoClientUri) {
    throw new Error('NEXT_PUBLIC_BLUESKY_CLIENT_URI must be provided')
  }

  return Response.json(
    clientMetadata({
      atprotoClientUri,
    })
  )
}
