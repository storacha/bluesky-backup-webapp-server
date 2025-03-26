export const REQUIRED_ATPROTO_SCOPE = 'atproto transition:generic'
export const ATPROTO_DEFAULT_SOURCE = 'bsky.social'
export const ATPROTO_DEFAULT_SINK = 'atproto.storacha.network'

export const GATEWAY_HOSTNAME =
  process.env.NEXT_PUBLIC_STORACHA_GATEWAY_HOSTNAME || 'w3s.link'

if (process.env.NEXT_PUBLIC_STORACHA_GATEWAY_HOST) {
  console.warn(
    'WARNING! you should move to the NEXT_PUBLIC_STORACHA_GATEWAY_HOSTNAME by specifying the hostname of the gateway - ipfs-staging.w3s.link or ipfs.w3s.link are the two most common options'
  )
}
