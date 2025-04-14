import { createHash, randomBytes } from 'node:crypto';
import { JoseKey } from '@atproto/jwk-jose';
import { OAuthClient, } from '@atproto/oauth-client';
import { AtprotoHandleResolverNode, } from './atproto-handle-resolver-node.js';
import { toDpopKeyStore, } from './node-dpop-store.js';
export class NodeOAuthClient extends OAuthClient {
    static async fromClientId(options) {
        const clientMetadata = await OAuthClient.fetchMetadata(options);
        return new NodeOAuthClient({ ...options, clientMetadata });
    }
    constructor({ fetch, responseMode = 'query', fallbackNameservers, stateStore, sessionStore, requestLock = undefined, ...options }) {
        if (!requestLock) {
            // Ok if only one instance of the client is running at a time.
            console.warn('No lock mechanism provided. Credentials might get revoked.');
        }
        super({
            ...options,
            fetch,
            responseMode,
            handleResolver: new AtprotoHandleResolverNode({
                fetch,
                fallbackNameservers,
            }),
            runtimeImplementation: {
                requestLock,
                createKey: (algs) => JoseKey.generate(algs),
                getRandomValues: randomBytes,
                digest: (bytes, algorithm) => createHash(algorithm.name).update(bytes).digest(),
            },
            stateStore: toDpopKeyStore(stateStore),
            sessionStore: toDpopKeyStore(sessionStore),
        });
    }
}
