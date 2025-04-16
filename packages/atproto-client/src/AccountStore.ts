import type { Value, SimpleStore } from '@atproto-labs/simple-store'
import type { KVNamespace } from './cloudflare-types'

/*
 * A simple store that store values in a `KVNamespace`, namespaced by an
 * account.
 */
export class AccountStore<K extends string, V extends Value = Value>
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
