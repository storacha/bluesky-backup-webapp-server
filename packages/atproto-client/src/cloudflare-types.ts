// A subset of Cloudflare types. This library doesn't depend directly on
// Cloudflare, so we can't use the types from its library. But these will line
// up with the concrete implementations where the client is used.

export interface KVNamespace<K extends string = string> {
  put(
    key: K,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
    options?: KVNamespacePutOptions
  ): Promise<void>

  get(
    key: K
    // options?: Partial<KVNamespaceGetOptions<undefined>>,
  ): Promise<string | null>

  delete(key: K): Promise<void>
}

export interface KVNamespacePutOptions {
  expiration?: number
  expirationTtl?: number
  metadata?: unknown | null
}
