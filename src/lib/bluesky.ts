import { hydrateSymkey, Key } from '@/contexts/keychain'

/**
 * Hydrate the encryption key from the Key metadata and use
 * it to AES-GCM decrypt the data. A random 12 byte nonce is taken from the front
 * of the given buffer and the rest of the data is passed to the decryption
 * algorithm.
 */
export async function decrypt(
  key: Key,
  buffer: ArrayBuffer
): Promise<ArrayBuffer> {
  const decryptionKey = await hydrateSymkey(key)
  const iv = buffer.slice(0, 12)
  const encryptedBytes = buffer.slice(12)
  return await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    decryptionKey,
    encryptedBytes
  )
}
