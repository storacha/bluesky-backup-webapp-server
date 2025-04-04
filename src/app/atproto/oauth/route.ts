import { File } from 'node:buffer'
import { createClient } from '../client'

export async function POST(request: Request) {
  const formData = await request.formData()
  const handle = formData.get('handle')
  const account = formData.get('account')
  const ucan = formData.get('ucan')

  if (!handle || handle instanceof File) {
    return new Response('Missing handle', { status: 400 })
  }

  if (!account || account instanceof File) {
    return new Response('Missing account', { status: 400 })
  }

  if (!ucan || ucan instanceof File) {
    return new Response('Missing ucan', { status: 400 })
  }

  const client = createClient({ account: account as string })
  const url = await client.authorize(handle as string, {
    state: JSON.stringify({ ucan }),
  })
  return Response.redirect(url)
}
