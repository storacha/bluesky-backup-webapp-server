import { OAuthClientMetadataInput } from '@atproto/oauth-client-node'
import urlJoin from 'proper-url-join'

export const clientMetadata = ({
  atprotoClientUri,
}: {
  atprotoClientUri: string
}): OAuthClientMetadataInput => ({
  client_id: urlJoin(atprotoClientUri, 'atproto', 'oauth-client-metadata'),
  client_name: 'Storacha Bluesky Backups',
  client_uri: atprotoClientUri,
  // logo_uri: `${atprotoClientUri}/logo.png`,
  // tos_uri: `${atprotoClientUri}/tos`,
  // policy_uri: `${atprotoClientUri}/policy`,
  application_type: 'web',
  grant_types: ['authorization_code', 'refresh_token'],
  response_types: ['code'],
  redirect_uris: [urlJoin(atprotoClientUri, 'atproto', 'callback')],
  token_endpoint_auth_method: 'private_key_jwt',
  scope: 'atproto transition:generic',
  dpop_bound_access_tokens: true,
  token_endpoint_auth_signing_alg: 'ES256',
  jwks_uri: urlJoin(atprotoClientUri, 'atproto', 'jwks.json'),
})
