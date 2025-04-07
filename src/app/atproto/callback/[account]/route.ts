import { NextRequest } from 'next/server'
import { Agent as ATProtoAgent } from '@atproto/api'
import { createClient } from '../../client'
import { base64url } from 'multiformats/bases/base64'
import { Delegation } from '@ucanto/core'
import { isDid } from '@atproto/oauth-client-node'
import { authorize } from '../../../server/auth'

export async function GET (
  request: NextRequest,
  { params }: { params: Promise<{ account: string }> }
) {
  const { account } = await params
  const client = createClient({ account })

  if (!isDid(account)) {
    return new Response(`Account must be a DID, but got: ${account}`, {
      status: 400,
    })
  }

  const { session, state } = await client.callback(request.nextUrl.searchParams)

  if (!state) {
    return new Response('Missing state', { status: 400 })
  }

  const { ucan } = JSON.parse(state)

  const delegationResult = await Delegation.extract(base64url.decode(ucan))
  if (delegationResult.error) {
    return new Response('Invalid UCAN', { status: 400 })
  }
  
  const authorizeResult = await authorize(account, delegationResult.ok)
  if (authorizeResult.error) {
    console.error(authorizeResult.error.message)
    return new Response(`Error authorizing: ${authorizeResult.error.message}`)
  }

  console.log(`User authenticated as AT Proto user ${session.did} and Storacha user ${account}`)
  
  const agent = new ATProtoAgent(session)
  if (!agent.did) {
    return new Response('No DID found in session', { status: 400 })
  }

  // TODO: I think we need to store the ATProto OAuth token here so we can use it later?

  return new Response(
    `<html>
      <body>
        <script>
          window.close();
        </script>
      </body>
    </html>`,
    {
      headers: { 'Content-Type': 'text/html' },
    }
  )
}


