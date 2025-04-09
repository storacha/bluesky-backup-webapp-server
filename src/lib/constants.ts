export type DID_WEB = `did:web:${string}`;
export type DID_KEY = `did:key:${string}`;

export const STAGING_UPLOAD_SERVICE_PUBLIC_KEY = 'did:key:z6MkhcbEpJpEvNVDd3n5RurquVdqs5dPU16JDU5VZTDtFgnn';
export const PRODUCTION_UPLOAD_SERVICE_PUBLIC_KEY = 'did:key:z6MkqdncRZ1wj8zxCTDUQ8CRT8NQWd63T7mZRvZUX8B7XDFi';

export const REQUIRED_ATPROTO_SCOPE = 'atproto transition:generic'
export const ATPROTO_DEFAULT_SOURCE = 'bsky.social'
export const ATPROTO_DEFAULT_SINK = 'atproto.storacha.network'

export const IDENTITY_AUTHORITY = process.env.NEXT_PUBLIC_IDENTITY_AUTHORITY_DID as DID_WEB;
if (!IDENTITY_AUTHORITY) throw new Error('NEXT_PUBLIC_IDENTITY_AUTHORITY must be set to the did:web of the service whose authentication decisions we trust - usually this should be did:web:up.storacha.network or did:web:staging.up.storacha.network');

export const SERVER_DID = process.env.NEXT_PUBLIC_SERVER_DID as DID_WEB;
if (!SERVER_DID) throw new Error('SERVER_DID must be set');

export const GATEWAY_HOSTNAME =
  process.env.NEXT_PUBLIC_STORACHA_GATEWAY_HOSTNAME || 'w3s.link'

if (process.env.NEXT_PUBLIC_STORACHA_GATEWAY_HOST) {
  console.warn(
    'WARNING! you should move to the NEXT_PUBLIC_STORACHA_GATEWAY_HOSTNAME by specifying the hostname of the gateway - ipfs-staging.w3s.link or ipfs.w3s.link are the two most common options'
  )
}
