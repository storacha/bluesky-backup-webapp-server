import { atproto } from '@/lib/capabilities'
import { Capabilities } from '@ipld/dag-ucan'
import { ok, Schema } from '@ucanto/core'

import { Delegation as DelegationType } from '@ucanto/interface'
import { ed25519, Verifier } from '@ucanto/principal'
import { access, DIDResolutionError } from '@ucanto/validator'
import { SERVER_DID, IDENTITY_AUTHORITY } from '@/lib/constants'
import {
  PRODUCTION_UPLOAD_SERVICE_PUBLIC_KEY,
  STAGING_UPLOAD_SERVICE_PUBLIC_KEY,
  DID_WEB,
  DID_KEY,
} from '@/lib/constants'
import { SERVER_IDENTITY_PRIVATE_KEY } from '@/lib/server/constants'

const serverKey = ed25519.Signer.parse(SERVER_IDENTITY_PRIVATE_KEY)
export const serverIdentity = serverKey.withDID(SERVER_DID)

/**
 * Mapping of known WebDIDs to their corresponding DIDKeys for Production and Staging environments.
 * This is used to resolve the DIDKey for known WebDIDs in the `resolveDIDKey` method.
 * It is not a definitive solution, nor a exhaustive list, but rather a stop-gap measure - real
 * web DID resolution with caching should be implemented when we have a chance
 */

export const principalMapping = {
  // Production
  'did:web:up.storacha.network': PRODUCTION_UPLOAD_SERVICE_PUBLIC_KEY,
  'did:web:web3.storage': PRODUCTION_UPLOAD_SERVICE_PUBLIC_KEY, // legacy
  'did:web:w3s.link':
    'did:key:z6Mkha3NLZ38QiZXsUHKRHecoumtha3LnbYEL21kXYBFXvo5',

  // Staging
  'did:web:staging.up.storacha.network': STAGING_UPLOAD_SERVICE_PUBLIC_KEY,
  'did:web:staging.web3.storage': STAGING_UPLOAD_SERVICE_PUBLIC_KEY, // legacy
  'did:web:staging.w3s.link':
    'did:key:z6MkqK1d4thaCEXSGZ6EchJw3tDPhQriwynWDuR55ayATMNf',

  // Service
  [serverIdentity.did()]: serverIdentity.toDIDKey(),
} as Record<DID_WEB, DID_KEY>

const authorityPublicKey = principalMapping[IDENTITY_AUTHORITY]
console.log(IDENTITY_AUTHORITY)
console.log(authorityPublicKey)
if (!authorityPublicKey)
  throw new Error(
    `could not find public key for principal identified by IDENTITY_AUTHORITY=${IDENTITY_AUTHORITY}`
  )

export const authority =
  ed25519.Verifier.parse(authorityPublicKey).withDID(IDENTITY_AUTHORITY)

export const authorize = async (
  account: `did:${string}:${string}`,
  proof: DelegationType<Capabilities>
) => {
  const invocation = await atproto
    .invoke({
      issuer: serverIdentity,
      audience: serverIdentity,
      with: account,
      proofs: [proof],
    })
    .delegate()

  // Validate the invocation.
  const accessResult = await access(invocation, {
    capability: atproto,
    authority: authority,
    principal: Verifier,
    // TODO at some point we need to implement revocation here
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
    },
  })
  return accessResult
}
