'use client'
import { SERVER_DID } from '@/lib/constants'
import { Did } from '@atproto/oauth-client-node'
import { Capabilities } from '@ipld/dag-ucan'
import * as SpaceBlob from '@storacha/capabilities/space/blob'
import * as SpaceIndex from '@storacha/capabilities/space/index'
import * as Upload from '@storacha/capabilities/upload'
import { Client } from '@storacha/client'
import { Delegation } from '@ucanto/core'

interface DelegateOptions {
  // number of milliseconds this delegation should be valid for
  duration?: number
}

// default to 1 hour
const defaultDuration = 1000 * 60 * 60

export async function delegate(
  client: Client,
  space: Did<'key'>,
  { duration = defaultDuration }: DelegateOptions = {}
) {
  const issuer = client.agent.issuer

  const capabilities: Capabilities = [
    {
      can: SpaceBlob.add.can,
      with: space,
    },
    {
      can: SpaceIndex.add.can,
      with: space,
    },
    {
      can: Upload.add.can,
      with: space,
    },
  ]

  const delegation = await Delegation.delegate({
    issuer: issuer,
    audience: { did: () => SERVER_DID },
    capabilities,
    proofs: client.proofs(capabilities),
    expiration: new Date(Date.now() + duration).getTime(),
  })

  const result = await delegation.archive()

  if (result.error) {
    throw result.error
  }
  return result.ok
}
