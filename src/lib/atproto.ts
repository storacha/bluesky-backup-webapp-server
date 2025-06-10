import { Did } from '@atproto/api'
import { JoseKey } from '@atproto/jwk-jose'
import {
  isDidPlc,
  NodeOAuthClient,
  OAuthClientMetadataInput,
} from '@atproto/oauth-client-node'
import urlJoin from 'proper-url-join'

import { getStorageContext, KVNamespace, requestLock } from '@/lib/server/db'
import { getSession } from '@/lib/sessions'

import { NEXT_PUBLIC_APP_URI } from './constants'
import { getConstants } from './server/constants'

import type { SimpleStore, Value } from '@atproto-labs/simple-store'

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

export async function findAuthedBskyAccounts(
  authSessions: KVNamespace,
  account: string
): Promise<Did[]> {
  const keysResult = await authSessions.list({
    prefix: `${account}!`,
  })

  return keysResult.keys.map((key) => {
    const account = key.name.split('!')[1]
    if (!account)
      throw new Error(
        `Found auth session key ${key.name} without account part, something is wrong!`
      )
    if (!isDidPlc(account)) throw new Error(`${account} is not a did:plc`)
    return account
  })
}

export const blueskyClientMetadata = ({
  account,
}: {
  account: string
}): OAuthClientMetadataInput => {
  return {
    client_id: urlJoin(
      NEXT_PUBLIC_APP_URI,
      'atproto',
      'oauth-client-metadata',
      encodeURIComponent(account)
    ),
    client_name: 'Storacha Bluesky Backups',
    client_uri: NEXT_PUBLIC_APP_URI,
    application_type: 'web',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    redirect_uris: [urlJoin(NEXT_PUBLIC_APP_URI, 'atproto', 'callback')],
    token_endpoint_auth_method: 'private_key_jwt',
    token_endpoint_auth_signing_alg: 'ES256',
    scope: 'atproto transition:generic',
    dpop_bound_access_tokens: true,
    jwks_uri: urlJoin(NEXT_PUBLIC_APP_URI, 'atproto', 'oauth', 'jwks'),
  }
}

export const createClient = async ({ account }: { account: string }) => {
  const { TOKEN_ENDPOINT_PRIVATE_KEY_JWK } = getConstants()
  const { authSessionStore, authStateStore } = getStorageContext()
  const client = new NodeOAuthClient({
    clientMetadata: blueskyClientMetadata({ account }),
    keyset: [await JoseKey.fromImportable(TOKEN_ENDPOINT_PRIVATE_KEY_JWK)],
    stateStore: new Store(authStateStore, account, 60 * 60),
    sessionStore: new Store(authSessionStore, account),
    requestLock,
  })

  return client
}

export const findAllIdentities = async () => {
  const { db, authSessionStore } = getStorageContext()
  const { did: account } = await getSession()

  // Get all connected accounts
  const connectedAccounts = await findAuthedBskyAccounts(
    authSessionStore,
    account
  )

  // Get all of the logged-in user's backups
  const { results: backupAccounts } = await db.findBackups(account)

  // Create a map of connected accounts for quick lookup
  const connectedMap = new Map(connectedAccounts.map((did) => [did, true]))

  // Create a map to deduplicate by atprotoAccount
  const identityMap = new Map()

  // Combine both sets with connection status, keeping only the most recent backup for each account
  backupAccounts.forEach((backup) => {
    const existing = identityMap.get(backup.atprotoAccount)
    if (!existing) {
      identityMap.set(backup.atprotoAccount, {
        ...backup,
        isConnected: connectedMap.has(backup.atprotoAccount),
      })
    }
  })

  return Array.from(identityMap.values())
}
