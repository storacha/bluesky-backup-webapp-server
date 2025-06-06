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

import { getConstants } from './server/constants'

import type { SimpleStore, Value } from '@atproto-labs/simple-store'

const atprotoClientUri = process.env.NEXT_PUBLIC_APP_URI

if (!atprotoClientUri) {
  throw new Error('NEXT_PUBLIC_APP_URI must be provided')
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
      atprotoClientUri,
      'atproto',
      'oauth-client-metadata',
      encodeURIComponent(account)
    ),
    client_name: 'Storacha Bluesky Backups',
    client_uri: atprotoClientUri,
    application_type: 'web',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    redirect_uris: [urlJoin(atprotoClientUri, 'atproto', 'callback')],
    token_endpoint_auth_method: 'private_key_jwt',
    token_endpoint_auth_signing_alg: 'ES256',
    scope: 'atproto transition:generic',
    dpop_bound_access_tokens: true,
    jwks_uri: urlJoin(atprotoClientUri, 'atproto', 'oauth', 'jwks'),
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

  // Create a map to store all identities (both connected and from backups)
  const identityMap = new Map()

  for (const did of connectedAccounts) {
    // Find the backup for this account if it exists
    const backup = backupAccounts.find((b) => b.atprotoAccount === did)
    if (backup) {
      identityMap.set(did, {
        ...backup,
        isConnected: true,
      })
    } else {
      // Account is connected but not in any backup
      identityMap.set(did, {
        atprotoAccount: did,
        isConnected: true,
      })
    }
  }

  // Then, add all accounts from backups that aren't connected
  for (const backup of backupAccounts) {
    if (!identityMap.has(backup.atprotoAccount)) {
      identityMap.set(backup.atprotoAccount, {
        ...backup,
        isConnected: false,
      })
    }

    // Then add any other accounts in this backup
    const { results: backupBskyAccounts } = await db.findBskyAccountsInBackups(
      backup.id
    )

    if (backupBskyAccounts?.length > 0) {
      for (const bskyAccount of backupBskyAccounts) {
        if (!isDidPlc(bskyAccount)) continue

        // Only add if not already in the map
        if (!identityMap.has(bskyAccount)) {
          identityMap.set(bskyAccount, {
            ...backup,
            atprotoAccount: bskyAccount as `did:${string}`,
            isConnected: false,
          })
        }
      }
    }
  }

  return Array.from(identityMap.values())
}
