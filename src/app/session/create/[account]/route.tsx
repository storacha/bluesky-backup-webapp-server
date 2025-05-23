import { Delegation } from '@ucanto/core'
import { NextRequest, NextResponse } from 'next/server'

import { isDidMailto } from '@/lib/constants'
import { authorize } from '@/lib/server/auth'
import { getSession } from '@/lib/sessions'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ account: string }> }
) {
  const { account } = await params

  if (!isDidMailto(account)) {
    return new Response(`Account must be a mailto DID, but got: ${account}`, {
      status: 400,
    })
  }
  const body = await request.blob()
  const delegationResult = await Delegation.extract(
    new Uint8Array(await body.arrayBuffer())
  )
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
