import { Capabilities } from '@ipld/dag-ucan'
import { ok, Schema } from '@ucanto/core'
import { Delegation as DelegationType } from '@ucanto/interface'
import { ed25519, Verifier } from '@ucanto/principal'
import { access, DIDResolutionError } from '@ucanto/validator'

import { atproto } from '@/lib/capabilities'
import { IDENTITY_AUTHORITY, SERVER_DID } from '@/lib/constants'
import {
  DidKey,
  DidWeb,
  PRODUCTION_UPLOAD_SERVICE_PUBLIC_KEY,
  STAGING_UPLOAD_SERVICE_PUBLIC_KEY,
} from '@/lib/constants'
import { getConstants } from '@/lib/server/constants'

import { BBDatabase } from './db'

let cachedServerIdentity: ed25519.Signer.Signer

export const getServerIdentity = () => {
  if (cachedServerIdentity) {
    return cachedServerIdentity
  }
  const envConstants = getConstants()
  cachedServerIdentity = ed25519.Signer.parse(
    envConstants.SERVER_IDENTITY_PRIVATE_KEY
  ).withDID(SERVER_DID)
  return cachedServerIdentity
}

/**
 * Mapping of known WebDIDs to their corresponding DIDKeys for Production and Staging environments.
 * This is used to resolve the DIDKey for known WebDIDs in the `resolveDIDKey` method.
 * It is not a definitive solution, nor a exhaustive list, but rather a stop-gap measure - real
 * web DID resolution with caching should be implemented when we have a chance
 */

let cachedPrincipalMapping: Record<DidWeb, DidKey>
const getPrincipalMapping = () => {
  if (cachedPrincipalMapping) {
    return cachedPrincipalMapping
  }
  const serverIdentity = getServerIdentity()
  cachedPrincipalMapping = {
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
  } as Record<DidWeb, DidKey>
  return cachedPrincipalMapping
}

let cachedAuthority: ed25519.Signer.Verifier
const getAuthority = () => {
  if (cachedAuthority) {
    return cachedAuthority
  }
  const principalMapping = getPrincipalMapping()
  const authorityPublicKey = principalMapping[IDENTITY_AUTHORITY]
  if (!authorityPublicKey)
    throw new Error(
      `could not find public key for principal identified by IDENTITY_AUTHORITY=${IDENTITY_AUTHORITY}`
    )
  cachedAuthority =
    ed25519.Verifier.parse(authorityPublicKey).withDID(IDENTITY_AUTHORITY)
  return cachedAuthority
}

export const authorize = async (
  account: `did:${string}:${string}`,
  proof: DelegationType<Capabilities>
) => {
  const serverIdentity = getServerIdentity()
  const invocation = await atproto
    .invoke({
      issuer: serverIdentity,
      audience: serverIdentity,
      with: account,
      proofs: [proof],
    })
    .delegate()

  // Validate the invocation.
  const authority = getAuthority()
  const accessResult = await access(invocation, {
    capability: atproto,
    authority: authority,
    principal: Verifier,
    // TODO at some point we need to implement revocation here
    validateAuthorization: () => ok({}),
    resolveDIDKey: async (did: `did:${string}:${string}`) => {
      if (Schema.did({ method: 'web' }).is(did)) {
        const didweb = did as `did:web:${string}`
        const principal = getPrincipalMapping()[didweb]
        if (principal) {
          return ok(principal)
        }
      }
      return { error: new DIDResolutionError(did) }
    },
  })
  return accessResult
}

export async function backupOwnedByAccount(
  db: BBDatabase,
  backupId: number,
  account: string
) {
  const { result: backup } = await db.findBackup(backupId)
  return backup?.accountDid === account
}

export async function snapshotOwnedByAccount(
  db: BBDatabase,
  snapshotId: number,
  account: string
): Promise<boolean> {
  // TODO: make this one database query
  const { result: snapshot } = await db.findSnapshot(snapshotId)
  if (!snapshot)
    throw new Error('cannot determind if snapshot is owned by account')
  const { result: backup } = await db.findBackup(snapshot.id)
  return backup?.accountDid === account
}
