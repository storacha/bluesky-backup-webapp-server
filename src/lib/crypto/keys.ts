/**
 * UTILITIES ADAPTED FROM @ucanto/principal 
 * 
 * TODO: EXPOSE FROM @ucanto/principal OR PULL TO A SHARED LIBRARY
 */

import * as SPKI from './spki.js'
import { varint } from 'multiformats'
import { base58btc } from 'multiformats/bases/base58'

export interface KeyPair {
  publicKey?: CryptoKey
  privateKey?: CryptoKey
  did: () => string
  toSecret?: () => Promise<string>
}

export const tagWith = (code: number, bytes: Uint8Array) => {
  const offset = varint.encodingLength(code)
  const multiformat = new Uint8Array(bytes.byteLength + offset)
  varint.encodeTo(code, multiformat, 0)
  multiformat.set(bytes, offset)

  return multiformat
}

const verifierCode = 0x1205

export const keyParams = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
  hash: { name: 'SHA-256' },
}

export const symkeyParams = {
  name: "AES-GCM",
  length: 256,
}

export async function calculateDID (publicKey: CryptoKey) {
  // Next we need to encode public key for the `did()` method. To do this we first export
  // Subject Public Key Info (SPKI) using web crypto API.
  const spki = await crypto.subtle.exportKey('spki', publicKey)
  // Then we extract public key from the SPKI and tag it with RSA public key
  // multicode
  const publicBytes = tagWith(verifierCode, SPKI.decode(new Uint8Array(spki)))
  return `did:key:${base58btc.encode(publicBytes)}`
}

export async function keysToKeypair ({ publicKey, privateKey }: { publicKey: CryptoKey, privateKey: CryptoKey }): Promise<KeyPair> {
  const did = await calculateDID(publicKey)
  return {
    publicKey,
    privateKey,
    did: () => did,
    toSecret: async () => JSON.stringify(
      {
        publicKey: await crypto.subtle.exportKey('jwk', publicKey),
        privateKey: await crypto.subtle.exportKey('jwk', privateKey),
      },
      null, 2
    )
  }
}

/**
 * This is very close to the `generate` function from @ucanto/principal/rsa
 * but specified encrypt and decrypt capabilities and exposes the DID generation
 * functions to make it easier to identify the key in the UI.
 */
export async function generateNewKeyPair (): Promise<KeyPair> {
  const keys = await crypto.subtle.generateKey(
    keyParams,
    true,
    ['encrypt', 'decrypt']
  )
  return keysToKeypair(keys)
}

export async function generateNewSymkey (): Promise<CryptoKey> {
  const key = await crypto.subtle.generateKey(
    symkeyParams,
    true,
    ['encrypt', 'decrypt']
  )
  return key
}
