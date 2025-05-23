'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/atproto'

export default async function connectHandle(formData: FormData) {
  let handle = formData.get('handle')
  const account = formData.get('account')

  if (!handle || !(typeof handle === 'string')) {
    throw new Error('Missing handle')
  }
  if (!handle.includes('.')) {
    handle = `${handle}.bsky.social`
  }

  if (!account || !(typeof account === 'string')) {
    throw new Error('Missing account')
  }

  const client = await createClient({ account: account })
  const url = await client.authorize(handle)
  redirect(url.toString())
}
