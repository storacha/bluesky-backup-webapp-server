/**
 * Create a "ucan/attest" delegation allowing UCANs that have attestions issued
 * by "alias-did" to be validated.
 *
 * Usage: node mk-validator-proof.mjs <service-did-web> <service-private-key> <alias-did-web>
 */
import * as DID from '@ipld/dag-ucan/did'
import { CAR, delegate } from '@ucanto/core'
import * as ed25519 from '@ucanto/principal/ed25519'
import { base64 } from 'multiformats/bases/base64'
import { identity } from 'multiformats/hashes/identity'
import * as Link from 'multiformats/link'

const service = ed25519
  .parse(process.argv[3])
  .withDID(DID.parse(process.argv[2]).did())
const alias = DID.parse(process.argv[4])

const delegation = await delegate({
  issuer: service,
  audience: alias,
  capabilities: [{ can: 'ucan/attest', with: service.did() }],
  expiration: Infinity,
})

const res = await delegation.archive()
if (res.error) throw res.error

console.log(Link.create(CAR.code, identity.digest(res.ok)).toString(base64))
