import { WebcryptoKey } from '@atproto/jwk-webcrypto'
import { AppViewHandleResolver } from '@atproto-labs/handle-resolver'
import { Key } from '@atproto/jwk'
// import { GenerateKeyPairOptions, JoseKey } from '@atproto/jwk-jose'
import { OAuthClient, type DigestAlgorithm } from '@atproto/oauth-client'
// import type { JWK } from 'jose'
import { AccountStore } from './AccountStore'
import { clientMetadata } from './clientMetadata'
import type { KVNamespace } from './cloudflare-types'
import { keysetPromise } from './keysetPromise'
import { toDpopKeyStore } from './node-dpop-store'

// function addAlgorithmToJWK(jwk: JWK): JWK {
//   if (!jwk.alg) {
//     switch (jwk.kty) {
//       case 'RSA':
//         // Default to RS256 if no alg is specified
//         jwk.alg = 'RS256'
//         break
//       case 'EC':
//         // Infer algorithm based on curve
//         if (jwk.crv === 'P-256') {
//           jwk.alg = 'ES256'
//         } else if (jwk.crv === 'P-384') {
//           jwk.alg = 'ES384'
//         } else if (jwk.crv === 'P-521') {
//           jwk.alg = 'ES512'
//         } else if (jwk.crv === 'secp256k1') {
//           jwk.alg = 'ES256K'
//         } else {
//           throw new Error('Unsupported EC curve')
//         }
//         break
//       case 'oct':
//         // Default to HS256 for symmetric keys
//         jwk.alg = 'HS256'
//         break
//       default:
//         throw new Error(`Unsupported key type: ${jwk.kty}`)
//     }
//   }

//   return jwk
// }
const resolver = new AppViewHandleResolver('https://bsky.social', {})

// async function generate(
//   allowedAlgos: string[] = ['ES256'],
//   kid?: string,
//   options?: Omit<GenerateKeyPairOptions, 'extractable'>
// ) {
//   const kp = await JoseKey.generateKeyPair(allowedAlgos, {
//     ...options,
//     extractable: true,
//   })
//   console.log({ kp })
//   debugger
//   return JoseKey.fromImportable(kp.privateKey.key, kid)
// }

export const createClient = async ({
  atprotoClientUri,
  account,
  sessionStoreKV,
  stateStoreKV,
}: {
  atprotoClientUri: string
  account: string
  sessionStoreKV: KVNamespace
  stateStoreKV: KVNamespace
}) => {
  const client = new OAuthClient({
    fetch: globalThis.fetch,
    responseMode: 'query',
    handleResolver: resolver,
    runtimeImplementation: {
      // A runtime specific implementation of the crypto operations needed by the
      // OAuth client. See "@atproto/oauth-client-browser" for a browser specific
      // implementation. The following example is suitable for use in NodeJS.
      async createKey(algs: string[]): Promise<Key> {
        // algs is an ordered array of preferred algorithms (e.g. ['RS256', 'ES256'])
        // Note, in browser environments, it is better to use non extractable keys
        // to prevent the private key from being stolen. This can be done using
        // the WebcryptoKey class from the "@atproto/jwk-webcrypto" package. The
        // inconvenient of these keys (which is also what makes them stronger) is
        // that the only way to persist them across browser reloads is to save
        // them in the indexed DB.
        // const joseKey = await generate(algs)
        // const jwk = joseKey.privateJwk!
        // addAlgorithmToJWK(jwk)

        // return joseKey
        // return WebcryptoKey.generate(algs)

        function isCryptoKeyPair(
          v: unknown,
          extractable?: boolean
        ): v is CryptoKeyPair {
          return (
            typeof v === 'object' &&
            v !== null &&
            'privateKey' in v &&
            v.privateKey instanceof CryptoKey &&
            v.privateKey.type === 'private' &&
            (extractable == null || v.privateKey.extractable === extractable) &&
            v.privateKey.usages.includes('sign') &&
            'publicKey' in v &&
            v.publicKey instanceof CryptoKey &&
            v.publicKey.type === 'public' &&
            v.publicKey.extractable === true &&
            v.publicKey.usages.includes('verify')
          )
        }

        const kid: string = crypto.randomUUID()
        // const keyPair = await WebcryptoKey.generateKeyPair(
        //   // TEMP (?): Only use ES256 for now
        //   algs.filter((a) => a === 'ES256')
        // )

        if (!algs.includes('ES256')) {
          throw new TypeError(
            `Unsupported algorithm. Only ES256 is supported, but asked for: ${algs}`
          )
        }

        const keyPair = await crypto.subtle.generateKey(
          {
            name: 'ECDSA',
            namedCurve: 'P-256',
          },
          true,
          ['sign', 'verify']
        )

        globalThis.keyPair = keyPair
        if (!isCryptoKeyPair(keyPair)) {
          throw new TypeError('Invalid CryptoKeyPair :(')
        }

        return WebcryptoKey.fromKeypair(keyPair, kid)
      },
      getRandomValues(byteLength: number): Uint8Array {
        return crypto.getRandomValues(new Uint8Array(byteLength))
      },
      async digest(
        data: Uint8Array,
        { name }: DigestAlgorithm
      ): Promise<Uint8Array> {
        switch (name) {
          case 'sha256':
          case 'sha384':
          case 'sha512': {
            const buf = await crypto.subtle.digest(`SHA-${name.slice(3)}`, data)
            return new Uint8Array(buf)
          }
          default:
            throw new Error(`Unsupported digest algorithm: ${name}`)
        }
      },
    },
    // This object will be used to build the payload of the /client-metadata.json
    // endpoint metadata, exposing the client metadata to the OAuth server.
    clientMetadata: clientMetadata({ atprotoClientUri: atprotoClientUri }),

    // NOTE! If this has a TypeScript error, it may be because there are two
    // versions of `@atproto/jwk` at play. Try `pnpm why @atproto/jwk` to
    // diagnose the problem. If the version specifiers should be compatible, you
    // may need to `pnpm dedupe` to get them to line up. A better solution would
    // be for the library to depend on an interface instead of the concrete
    // `Key` class, so TypeScript can check them structurally instead of
    // nominally.
    keyset: await keysetPromise,

    stateStore: toDpopKeyStore(
      new AccountStore(stateStoreKV, account, 60 * 60)
    ),
    sessionStore: toDpopKeyStore(new AccountStore(sessionStoreKV, account)),
  })
  return client
}
