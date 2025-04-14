import { safeFetchWrap } from './fetch-node';
import { AtprotoHandleResolver, } from '@atproto-labs/handle-resolver';
import { nodeResolveTxtDefault, nodeResolveTxtFactory, } from './node-resolve-txt-factory.js';
export class AtprotoHandleResolverNode extends AtprotoHandleResolver {
    constructor({ fetch = globalThis.fetch, fallbackNameservers, } = {}) {
        super({
            fetch: safeFetchWrap({
                fetch,
                timeout: 3000, // 3 seconds
                ssrfProtection: true,
                responseMaxSize: 10 * 1048, // DID are max 2048 characters, 10kb for safety
            }),
            resolveTxt: nodeResolveTxtDefault,
            resolveTxtFallback: fallbackNameservers?.length
                ? nodeResolveTxtFactory(fallbackNameservers)
                : undefined,
        });
    }
}
