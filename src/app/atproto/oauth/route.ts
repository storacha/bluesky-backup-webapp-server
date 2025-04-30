import { createClient } from '@/lib/atproto'

export async function POST(request: Request) {
  const formData = await request.formData()
  const handle = formData.get('handle')
  const account = formData.get('account')

  if (!handle || !(typeof handle === 'string')) {
    return new Response('Missing handle', { status: 400 })
  }

  if (!account || !(typeof account === 'string')) {
    return new Response('Missing account', { status: 400 })
  }

  const client = createClient({ account: account })
  console.log("Client metadata", client.clientMetadata)
  const url = await client.authorize(handle)
  return Response.redirect(url)
}
