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
