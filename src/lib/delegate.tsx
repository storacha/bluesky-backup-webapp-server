'use client'
import { Did } from '@atproto/oauth-client-node'
import { Capabilities } from '@ipld/dag-ucan'
import * as SpaceBlob from '@storacha/capabilities/space/blob'
import * as SpaceIndex from '@storacha/capabilities/space/index'
import * as Upload from '@storacha/capabilities/upload'
import { type Client } from '@storacha/ui-react'
import { Delegation } from '@ucanto/core'

import { SERVER_DID } from './constants'

interface DelegateOptions {
  // number of seconds this delegation should be valid for
  duration?: number
}

// default to 1 hour
const defaultDuration = 60 * 60

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
    expiration: Math.floor(Date.now() / 1000) + duration,
  })

  const result = await delegation.archive()

  if (result.error) {
    throw result.error
  }
  return result.ok
}
