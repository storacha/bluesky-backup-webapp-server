// adapted from https://github.com/did-method-plc/did-method-plc/blob/main/packages/lib/src/error.ts
// original license:
// Dual MIT / Apache - 2.0 License
//
// Copyright(c) 2022 - 2025 Bluesky Social PBC
//
// Except as otherwise noted in individual files, this software is licensed under the MIT license(<http://opensource.org/licenses/MIT>), or the Apache License, Version 2.0 (<http://www.apache.org/licenses/LICENSE-2.0>), at your option.

export class PlcError extends Error {
  plcError = true
  constructor(msg: string) {
    super(msg)
  }

  static is(obj: unknown): obj is PlcError {
    // @ts-expect-error ts rightly doesn't know that plcError is a thing, but that's fine
    if (obj && typeof obj === 'object' && obj['plcError'] === true) {
      return true
    }
    return false
  }
}
export class ImproperOperationError extends PlcError {
  constructor(
    public reason: string,
    public op: unknown
  ) {
    super(`Improperly formatted operation, ${reason}: ${op}`)
  }
}

export class MisorderedOperationError extends PlcError {
  constructor() {
    super('Operations not correctly ordered')
  }
}

export class LateRecoveryError extends PlcError {
  constructor(public timeLapsed: number) {
    super(
      `Recovery operation occurred outside of the allowed 72 hr recovery window. Time lapsed: ${timeLapsed}`
    )
  }
}

export class GenesisHashError extends PlcError {
  constructor(public expected: string) {
    super(
      `Hash of genesis operation does not match DID identifier: ${expected}`
    )
  }
}

export class InvalidSignatureError extends PlcError {
  constructor(public op: unknown) {
    super(`Invalid signature on op: ${JSON.stringify(op)}`)
  }
}

export class UnsupportedKeyError extends PlcError {
  constructor(
    public key: string,
    public err: unknown
  ) {
    super(`Unsupported key type ${key}: ${err}`)
  }
}

export class ImproperlyFormattedDidError extends PlcError {
  constructor(public reason: string) {
    super(`Improperly formatted did: ${reason}`)
  }
}
