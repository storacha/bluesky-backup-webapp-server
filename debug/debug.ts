// xxx IMPORTANT: Rememeber that `undici` is commented out in unicast.js
// import { safeFetchWrap } from '@atproto-labs/fetch-node'
// import { nodeResolveTxtDefault } from '@atproto-labs/handle-resolver-node/node-resolve-txt-factory.js'
// import {} from '@atproto-labs/fetch'

// import { NodeOAuthClient } from './node-oauth-client.js'
// import { NodeOAuthClient } from '@atproto/oauth-client-node'
// import { OAuthClientMetadataInput } from '@atproto/oauth-client'

import { ExportedHandler } from '@cloudflare/workers-types'

// const originalFetch = globalThis.fetch
// globalThis.fetch = async function patchedFetch(
//   ...args: Parameters<typeof fetch>
// ) {
//   if (args[1]) {
//     if (args[1].redirect === 'error') {
//       console.debug(
//         `sanitizing fetch: The 'redirect: "error"' option is not supported in Cloudflare Workers. Using 'redirect: "manual"' instead.`
//       )
//       args[1].redirect = 'manual'
//     }
//   }

//   return originalFetch(...args)
// }

// console.log({ originalFetch, fetch })

const worker: ExportedHandler = {
  // async fetch(/* request, env, ctx */) {
  //   const response = await fetch('https://example.com', { redirect: 'error' })
  //   console.log(await response.text())
  //   return new Response('Hello!') as unknown as CFResponse
  // },
}

export default worker

// console.log(NodeOAuthClient)

// console.log(
//   safeFetchWrap({
//     fetch,
//     timeout: 3000, // 3 seconds
//     ssrfProtection: true,
//     responseMaxSize: 10 * 1048, // DID are max 2048 characters, 10kb for safety
//   })
// )

import { generateKeyPair } from 'jose'

console.log(Symbol.toStringTag)
const privateKey = (await generateKeyPair('ES256')).privateKey
console.log(privateKey[Symbol.toStringTag])
privateKey[Symbol.toStringTag] = 'CryptoKey'
console.log(privateKey[Symbol.toStringTag])
