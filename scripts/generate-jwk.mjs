import { JoseKey } from '@atproto/jwk-jose'
import * as uuid from 'uuid'
const keypair = await JoseKey.generate(['ES256'], uuid.v4())

// this can be used as the value of TOKEN_ENDPOINT_PRIVATE_KEY_JWK
console.log(JSON.stringify(keypair.privateJwk))
