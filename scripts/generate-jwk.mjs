import fs from 'node:fs'
import path from 'node:path'

import { JoseKey } from '@atproto/jwk-jose'
import * as uuid from 'uuid'

const keypair = await JoseKey.generate(['ES256'], uuid.v4())

console.log('this can be used as the value of TOKEN_ENDPOINT_PRIVATE_KEY_JWK:')
console.log(JSON.stringify(keypair.privateJwk))

const envPath = path.resolve(process.cwd(), '.env')

fs.appendFile(
  envPath,
  `\nTOKEN_ENDPOINT_PRIVATE_KEY_JWK=${JSON.stringify(keypair.privateJwk)}`,
  (error) => {
    if (error) {
      console.error(error)
    } else {
      console.log('Check .env for this key: TOKEN_ENDPOINT_PRIVATE_KEY_JWK')
    }
  }
)
