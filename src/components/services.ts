import type { Service } from '@storacha/ui-react'
import { connect } from '@ucanto/client'
import { CAR, HTTP } from '@ucanto/transport'
import * as DID from '@ipld/dag-ucan/did'

const die = (name: string) => {
  throw new Error(`Environment variable ${name} is required and not set.`)
}

export const serviceURL = new URL(
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

export const serviceConnection = connect<Service>({
  id: servicePrincipal,
  codec: CAR.outbound,
  channel: HTTP.open({
    url: serviceURL,
    method: 'POST',
  }),
})
