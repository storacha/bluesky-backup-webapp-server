import { NextRequest } from 'next/server'
import { ok, access, DIDResolutionError, Schema } from '@ucanto/validator'
import { ed25519, Verifier } from '@ucanto/principal'
import { Agent } from '@atproto/api'
import { createClient } from '../../client'
import { base64url } from 'multiformats/bases/base64'
import { Capabilities, Delegation as DelegationType } from '@ucanto/interface'
import { Delegation } from '@ucanto/core'
import { isDid } from '@atproto/oauth-client-node'
import { atproto } from '@/lib/capabilities'

/**
 * Mapping of known WebDIDs to their corresponding DIDKeys for Production and Staging environments.
 * This is used to resolve the DIDKey for known WebDIDs in the `resolveDIDKey` method.
 * It is not a definitive solution, nor a exhaustive list, but rather a stop-gap measure - real 
 * web DID resolution with caching should be implemented when we have a chance
 * 
 */
export const principalMapping = {
  // Production
  'did:web:up.storacha.network': 'did:key:z6MkqdncRZ1wj8zxCTDUQ8CRT8NQWd63T7mZRvZUX8B7XDFi',
  'did:web:web3.storage': 'did:key:z6MkqdncRZ1wj8zxCTDUQ8CRT8NQWd63T7mZRvZUX8B7XDFi', // legacy
  'did:web:w3s.link': 'did:key:z6Mkha3NLZ38QiZXsUHKRHecoumtha3LnbYEL21kXYBFXvo5',

  // Staging
  'did:web:staging.up.storacha.network': 'did:key:z6MkhcbEpJpEvNVDd3n5RurquVdqs5dPU16JDU5VZTDtFgnn',
  'did:web:staging.web3.storage': 'did:key:z6MkhcbEpJpEvNVDd3n5RurquVdqs5dPU16JDU5VZTDtFgnn', // legacy
  'did:web:staging.w3s.link': 'did:key:z6MkqK1d4thaCEXSGZ6EchJw3tDPhQriwynWDuR55ayATMNf',
} as Record<`did:web:${string}`, `did:key:${string}`>

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
  console.log(JSON.stringify(delegationResult, null, 4))
  // NEEDS UCAN AUTHORIZATION
  const authorizeResult = await authorize(account, delegationResult.ok)
  console.log('Authorization result:', JSON.stringify(authorizeResult, null, 4))
  if (authorizeResult.error) {
    console.log(authorizeResult.error.message)
  }
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
  console.log("INVOCATION")
  console.log(JSON.stringify(invocation, null, 4))

  // Validate the invocation.
  const accessResult = await access(invocation, {
    capability: atproto,
    authority: identity,
    principal: Verifier,
    validateAuthorization: () => ok({}),
    resolveDIDKey: async (did: `did:${string}:${string}`) => {
      if (Schema.did({ method: 'web' }).is(did)) {
        const didweb = did as `did:web:${string}`
        const principal = principalMapping[didweb]
        if (principal) {
          return ok(principal)
        }
      }
      return { error: new DIDResolutionError(did) }

    }
  })
  // console.log("ACCESS RESULT")
  // console.log(JSON.stringify(accessResult, null, 4))
  // if (accessResult.error) {
  //   console.log(accessResult.error.message)
  // }
  return accessResult
}


