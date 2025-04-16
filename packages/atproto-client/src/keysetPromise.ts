import { Keyset } from '@atproto/jwk'
import { GenerateKeyPairOptions, JoseKey } from '@atproto/jwk-jose'

// JOSE expects the Symbol.toStringTag of a CryptoKey to be 'CryptoKey', but on
// Cloudflare it's not defined. JOSE looks at the Symbol.toStringTag to
// determine if the key is a CryptoKey, thinks it has some random object, and
// throws. This patches that.
// const originalGenerateKeyPair = JoseKey.generateKeyPair
// JoseKey.generateKeyPair = async (
//   allowedAlgos?: readonly string[],
//   options?: GenerateKeyPairOptions
// ) => {
//   const keyPair = await originalGenerateKeyPair(allowedAlgos, options)

//   // debugger

//   for (const prop in keyPair) {
//     // @ts-expect-error ???
//     if (keyPair[prop].key instanceof CryptoKey) {
//       // @ts-expect-error ???
//       keyPair[prop] = keyPair[prop].key
//     }
//   }

//   // for (const key of [keyPair.privateKey, keyPair.publicKey]) {
//   //   if (key instanceof CryptoKey) {
//   //     // @ts-expect-error Force this property on
//   //     key[Symbol.toStringTag] = 'CryptoKey'
//   //   }
//   // }
//   return keyPair
// }

// const DEMO_KEY = `{
//   "kty": "EC",
//   "use": "sig",
//   "alg": "ES256",
//   "kid": "DEMO_ONLY",
//   "crv": "P-256",
//   "x": "123123123123",
//   "y": "456456456456456456456",
//   "d": "79789789789789797"
// }`

const keyPair = await crypto.subtle.generateKey(
  {
    name: 'ECDSA',
    namedCurve: 'P-256',
  },
  true,
  ['sign', 'verify']
)

globalThis.clientKeyPair = keyPair
globalThis.crypto_subtle = crypto.subtle
globalThis.crypto_subtle_generateKey = crypto.subtle.generateKey

export const keysetPromise = Promise.all([
  // JoseKey.fromImportable(import.meta.env.PRIVATE_KEY_1 ?? '', '0'),
  // JoseKey.fromImportable(import.meta.env.PRIVATE_KEY_2 ?? '', '1'),
  // JoseKey.fromImportable(import.meta.env.PRIVATE_KEY_3 ?? '', '2'),
  // For now, we're generating one on the fly on boot.
  // TODO: Keep real keys in env/secrets.
  // JoseKey.generate(),
  JoseKey.fromImportable(keyPair.privateKey, 'DEMO_ONLY'),
])

// const keyset = new Keyset(await keysetPromise)

// const jwt = await keyset.createJwt(
//   {
//     alg: 'ES256',
//     kid: 'DEMO_ONLY',
//   },
//   {
//     iss: 'https://foo.bar/baz',
//     sub: 'https://foo.bar/baz',
//     aud: 'http://localhost/bingo',
//     jti: 'a-nonce',
//     iat: Math.floor(Date.now() / 1000),
//   }
// )

// console.log({ jwt })
