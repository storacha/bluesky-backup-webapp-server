import * as DID from '@ipld/dag-ucan/did'
import { connect } from '@ucanto/client'
import { CAR, HTTP } from '@ucanto/transport'

import type { Service } from '@storacha/ui-react'

const die = (name: string) => {
  throw new Error(`Environment variable ${name} is required and not set.`)
}

const serviceURL = new URL(
  process.env.NEXT_PUBLIC_STORACHA_SERVICE_URL ??
    die('NEXT_PUBLIC_STORACHA_SERVICE_URL')
)

export const servicePrincipal = DID.parse(
  process.env.NEXT_PUBLIC_STORACHA_SERVICE_DID ??
    die('NEXT_PUBLIC_STORACHA_SERVICE_DID')
)

export const receiptsEndpoint = new URL(
  process.env.NEXT_PUBLIC_STORACHA_RECEIPTS_URL ??
    die('NEXT_PUBLIC_STORACHA_RECEIPTS_URL')
)

const version = process.env.NEXT_PUBLIC_VERSION ?? '1.0.0'

export const serviceConnection = connect<Service>({
  id: servicePrincipal,
  codec: CAR.outbound,
  channel: HTTP.open({
    url: serviceURL,
    method: 'POST',
    headers: { 'X-Client': `Storacha/1 (js; browser) BlueskyBackups/${version.split('.')[0]}` },
  }),
})
