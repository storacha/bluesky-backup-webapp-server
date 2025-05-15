// adapted from https://github.com/bluesky-social/atproto/blob/81fb69ac6571a90241d9d82acdb6a7248c9ce314/packages/xrpc-server/src/auth.ts
// Original license:
// Dual MIT / Apache - 2.0 License

// Copyright(c) 2022 - 2025 Bluesky Social PBC, and Contributors

// Except as otherwise noted in individual files, this software is licensed under the MIT license(<http://opensource.org/licenses/MIT>), or the Apache License, Version 2.0 (<http://www.apache.org/licenses/LICENSE-2.0>).

// Downstream projects and end users may chose either license individually, or both together, at their discretion.The motivation for this dual - licensing is the additional software patent assurance provided by Apache 2.0.

import { noUndefinedVals } from '@atproto/common-web'
import * as crypto from '@atproto/crypto'
import * as ui8 from 'uint8arrays'

const SECOND = 1000
const MINUTE = 60 * SECOND

type ServiceJwtParams = {
  iss: string
  aud: string
  iat?: number
  exp?: number
  lxm: string | null
  keypair: crypto.Keypair
}

const utf8ToB64Url = (utf8: string): string => {
  return ui8.toString(ui8.fromString(utf8, 'utf8'), 'base64url')
}

const jsonToB64Url = (json: Record<string, unknown>): string => {
  return utf8ToB64Url(JSON.stringify(json))
}

export const createServiceJwt = async (
  params: ServiceJwtParams
): Promise<string> => {
  const { iss, aud, keypair } = params
  const iat = params.iat ?? Math.floor(Date.now() / 1e3)
  const exp = params.exp ?? iat + MINUTE / 1e3
  const lxm = params.lxm ?? undefined
  const jti = crypto.randomStr(16, 'hex')
  const header = {
    typ: 'JWT',
    alg: keypair.jwtAlg,
  }
  const payload = noUndefinedVals({
    iat,
    iss,
    aud,
    exp,
    lxm,
    jti,
  })
  console.log('payload', payload)
  const toSignStr = `${jsonToB64Url(header)}.${jsonToB64Url(payload)}`
  const toSign = ui8.fromString(toSignStr, 'utf8')
  const sig = await keypair.sign(toSign)
  return `${toSignStr}.${ui8.toString(sig, 'base64url')}`
}
