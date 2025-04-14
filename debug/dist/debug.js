// xxx IMPORTANT: Rememeber that `undici` is commented out in unicast.js
// import { safeFetchWrap } from '@atproto-labs/fetch-node'
// import { nodeResolveTxtDefault } from '@atproto-labs/handle-resolver-node/node-resolve-txt-factory.js'
// import {} from '@atproto-labs/fetch'
// import { NodeOAuthClient } from './node-oauth-client.js'
import { NodeOAuthClient } from '@atproto/oauth-client-node';
// import { OAuthClientMetadataInput } from '@atproto/oauth-client'
const worker = {};
export default worker;
console.log(NodeOAuthClient);
// console.log(
//   safeFetchWrap({
//     fetch,
//     timeout: 3000, // 3 seconds
//     ssrfProtection: true,
//     responseMaxSize: 10 * 1048, // DID are max 2048 characters, 10kb for safety
//   })
// )
