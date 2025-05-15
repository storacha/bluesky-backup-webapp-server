// adapted from https://github.com/bluesky-social/atproto/blob/81fb69ac6571a90241d9d82acdb6a7248c9ce314/packages/common/src/ipld.ts
// original license:
// Dual MIT / Apache - 2.0 License
//
// Copyright(c) 2022 - 2025 Bluesky Social PBC, and Contributors
//
// Except as otherwise noted in individual files, this software is licensed under the MIT license(<http://opensource.org/licenses/MIT>), or the Apache License, Version 2.0 (<http://www.apache.org/licenses/LICENSE-2.0>).
//
// Downstream projects and end users may chose either license individually, or both together, at their discretion.The motivation for this dual - licensing is the additional software patent assurance provided by Apache 2.0.

import * as cborCodec from '@ipld/dag-cbor'
import * as Block from 'multiformats/block'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'

const dataToCborBlock = async (data: unknown) => {
  return Block.encode({
    value: data,
    codec: cborCodec,
    hasher: sha256,
  })
}

export const cidForCbor = async (data: unknown): Promise<CID> => {
  const block = await dataToCborBlock(data)
  return block.cid
}
