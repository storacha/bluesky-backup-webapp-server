import {
  NodeOAuthClient,
  OAuthClientMetadataInput,
} from '@atproto/oauth-client-node'
import urlJoin from 'proper-url-join'

// Note: This is from `@atproto-labs/`, so it's subject to breaking changes.
// That should be okay, as we're only depending on the types, and we can adjust
// as any updates happen.
import type { SimpleStore, Value } from '@atproto-labs/simple-store'
import { getStorageContext, KVNamespace } from '@/lib/server/db'

export const atprotoClientUri = process.env.NEXT_PUBLIC_BLUESKY_CLIENT_URI

if (!atprotoClientUri) {
  throw new Error('NEXT_PUBLIC_BLUESKY_CLIENT_URI must be provided')
}

class Store<K extends string, V extends Value = Value>
  implements SimpleStore<K, V>
{
  constructor(
    private readonly kvStore: KVNamespace,
    private readonly account: string,
    private readonly expirationTtl?: number
  ) {}

  // `!` seems like a safe delimiter for the account and key, as it shouldn't be
  // in a DID.
  private makeKey(key: string) {
    return `${this.account}!${key}`
  }

  async set(key: K, internalState: V): Promise<void> {
    this.kvStore.put(this.makeKey(key), JSON.stringify(internalState), {
      expirationTtl: this.expirationTtl,
    })
  }
  async get(key: K) {
    const jsonValue = await this.kvStore.get(this.makeKey(key))
    if (jsonValue) {
      return JSON.parse(jsonValue)
    }
  }
  async del(key: K) {
    this.kvStore.delete(this.makeKey(key))
  }
}

export const blueskyClientMetadata = ({
  account,
}: {
  account: string
}): OAuthClientMetadataInput => ({
  client_id: urlJoin(
    atprotoClientUri,
    'atproto',
    'oauth-client-metadata',
    account
  ),
  client_name: 'Storacha Bluesky Backups',
  client_uri: atprotoClientUri,
  application_type: 'web',
  grant_types: ['authorization_code', 'refresh_token'],
  response_types: ['code'],
  redirect_uris: [urlJoin(atprotoClientUri, 'atproto', 'callback')],
  token_endpoint_auth_method: 'none',
  scope: 'atproto transition:generic',
  dpop_bound_access_tokens: true,
})

export const createClient = ({ account }: { account: string }) => {
  const {
    authSessionStore, authStateStore
  } = getStorageContext()

  const client = new NodeOAuthClient({
    clientMetadata: blueskyClientMetadata({ account }),

    // TODO: Keys
    // Used to authenticate the client to the token endpoint. Will be used to
    // build the jwks object to be exposed on the "jwks_uri" endpoint.
    // keyset: await Promise.all([
    //   JoseKey.fromImportable(process.env.PRIVATE_KEY_1),
    //   JoseKey.fromImportable(process.env.PRIVATE_KEY_2),
    //   JoseKey.fromImportable(process.env.PRIVATE_KEY_3),
    // ]),

    stateStore: new Store(authStateStore, account, 60 * 60),
    sessionStore: new Store(authSessionStore, account),

    // TODO: Can we even implement this in KV? Should we?
    // requestLock,
  })

  return client
}
