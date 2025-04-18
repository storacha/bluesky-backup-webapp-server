export type DidWeb = `did:web:${string}`
export type DidKey = `did:key:${string}`
export function isDidWeb(s?: string): s is DidWeb {
  return Boolean(s && s.startsWith('did:web'))
}
export function isDidKey(s?: string): s is DidKey {
  return Boolean(s && s.startsWith('did:key'))
}

export const STAGING_UPLOAD_SERVICE_PUBLIC_KEY =
  'did:key:z6MkhcbEpJpEvNVDd3n5RurquVdqs5dPU16JDU5VZTDtFgnn'
export const PRODUCTION_UPLOAD_SERVICE_PUBLIC_KEY =
  'did:key:z6MkqdncRZ1wj8zxCTDUQ8CRT8NQWd63T7mZRvZUX8B7XDFi'

export const REQUIRED_ATPROTO_SCOPE = 'atproto transition:generic'
export const ATPROTO_DEFAULT_SOURCE = 'bsky.social'
export const ATPROTO_DEFAULT_SINK = 'atproto.storacha.network'

if (!isDidWeb(process.env.NEXT_PUBLIC_IDENTITY_AUTHORITY))
  throw new Error(
    'NEXT_PUBLIC_IDENTITY_AUTHORITY must be set to the did:web of the service whose authentication decisions we trust - usually this should be did:web:up.storacha.network or did:web:staging.up.storacha.network'
  )
export const IDENTITY_AUTHORITY = process.env.NEXT_PUBLIC_IDENTITY_AUTHORITY

if (
  !(
    isDidWeb(process.env.NEXT_PUBLIC_SERVER_DID) ||
    isDidKey(process.env.NEXT_PUBLIC_SERVER_DID)
  )
)
  throw new Error('NEXT_PUBLIC_SERVER_DID must be set')
export const SERVER_DID = process.env.NEXT_PUBLIC_SERVER_DID

const GATEWAY_HOSTNAME_DEFAULT_VALUE = 'w3s.link'
export const GATEWAY_HOSTNAME =
  process.env.NEXT_PUBLIC_STORACHA_GATEWAY_HOSTNAME ||
  GATEWAY_HOSTNAME_DEFAULT_VALUE

if (!process.env.NEXT_PUBLIC_STORACHA_GATEWAY_HOSTNAME) {
  console.warn(
    `NEXT_PUBLIC_STORACHA_GATEWAY_HOSTNAME not set, using default value of ${GATEWAY_HOSTNAME_DEFAULT_VALUE}`
  )
}
