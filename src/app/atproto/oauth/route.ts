import { File } from 'node:buffer'
import { createClient } from '../client'

export async function POST(request: Request) {
  const formData = await request.formData()
  const handle = formData.get('handle')
  const account = formData.get('account')

  if (!handle || handle instanceof File) {
    return new Response('Missing handle', { status: 400 })
  }

  if (!account || account instanceof File) {
    return new Response('Missing account', { status: 400 })
  }

  const client = createClient({ account: account as string })
  const url = await client.authorize(handle as string)
  return Response.redirect(url)
}
