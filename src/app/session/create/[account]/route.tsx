import { NextRequest, NextResponse } from 'next/server'
import { Delegation } from '@ucanto/core'
import { isDid } from '@atproto/oauth-client-node'
import { authorize } from '@/lib/server/auth'
import { getSession } from '@/lib/sessions'

export async function POST (
  request: NextRequest,
  { params }: { params: Promise<{ account: string }> }
) {
  const { account } = await params

  if (!isDid(account)) {
    return new Response(`Account must be a DID, but got: ${account}`, {
      status: 400,
    })
  }
  const body = await request.blob()
  const delegationResult = await Delegation.extract(new Uint8Array(await body.arrayBuffer()))
  if (delegationResult.error) {
    console.error(delegationResult.error)
    return new Response('Invalid UCAN', { status: 400 })
  }

  const authorizeResult = await authorize(account, delegationResult.ok)
  if (authorizeResult.error) {
    console.error(authorizeResult.error)
    return new Response('error authorizing this request', { status: 401 })
  } else {
    const response = new NextResponse('success')
    const session = await getSession()
    session.did = account
    await session.save()
    return response
  }
}
