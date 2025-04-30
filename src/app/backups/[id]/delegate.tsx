'use client'
import { Did } from '@atproto/oauth-client-node'
import { Capabilities } from '@ipld/dag-ucan'
import * as SpaceBlob from '@storacha/capabilities/space/blob'
import * as SpaceIndex from '@storacha/capabilities/space/index'
import * as Upload from '@storacha/capabilities/upload'
import { Client } from '@storacha/client'
import { Delegation } from '@ucanto/core'

import { SERVER_DID } from '@/lib/constants'

export async function delegate(client: Client, space: Did<'key'>) {
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
    expiration: new Date(Date.now() + 1000 * 60 * 60).getTime(), // 1 hour
  })

  const result = await delegation.archive()

  if (result.error) {
    throw result.error
  }
  return result.ok
}
