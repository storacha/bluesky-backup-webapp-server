import { NextRequest } from 'next/server'
import { ok, access, capability, DID } from '@ucanto/validator'
import { ed25519, Verifier } from '@ucanto/principal'
import { Agent } from '@atproto/api'
import { createClient } from '../../client'
import { base64url } from 'multiformats/bases/base64'
import { Capabilities, Delegation as DelegationType } from '@ucanto/interface'
import { Delegation } from '@ucanto/core'
import { isDid } from '@atproto/oauth-client-node'

export async function GET(
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

  // NEEDS UCAN AUTHORIZATION
  // const authorizeResult = await authorize(account, delegationResult.ok)
  // console.log('Authorization result:', authorizeResult)

  console.log('User authenticated as:', session.did)

  const agent = new Agent(session)

  if (!agent.did) {
    return new Response('No DID found in session', { status: 400 })
  }

  // return Response.json({ profile: profile.data })

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

const identity = (await ed25519.Signer.generate()).withDID(
  'did:web:bskybackups.storacha.network'
)

// TODO: Make this work and actually use it
const authorize = async (
  account: `did:${string}:${string}`,
  proof: DelegationType<Capabilities>
) => {
  const invocation = await atproto
    .invoke({
      issuer: identity,
      audience: identity,
      with: account,
      proofs: [proof],
    })
    .delegate()

  // Validate the invocation.
  const accessResult = await access(invocation, {
    capability: atproto,
    authority: identity,
    principal: Verifier,
    validateAuthorization: () => ok({}),
  })
  return accessResult
}

/**
 * The ability change atproto logins on this service for a given Account.
 */
export const atproto = capability({
  can: 'bskybackups.storacha.network/atproto',
  /**
   * The Account
   */
  with: DID,
})
