import { AnyLink, CARLink } from '@storacha/ui-react'

import { GATEWAY_HOSTNAME } from './constants'

import type { Client } from '@storacha/client'

export function cidUrl(cid: string) {
  return `https://${cid}.${GATEWAY_HOSTNAME}`
}

export async function uploadCAR(
  storachaClient: Client,
  blob: Blob
): Promise<{ uploadCid: AnyLink; carCid: CARLink }> {
  let carCid: CARLink | undefined
  const uploadCid = await storachaClient.uploadCAR(blob, {
    onShardStored: (carMetadata) => {
      carCid = carMetadata.cid
    },
    // set shard size to 4 GiB - the maximum shard size
    shardSize: 1024 * 1024 * 1024 * 4,
  })
  if (!carCid)
    throw new Error(
      'Uploaded CAR but did not get shard ID, this is unexpected.'
    )
  return { carCid, uploadCid }
}

export async function loadCid(
  cid: string,
  encryptedWith?: string
): Promise<ArrayBuffer> {
  console.log('ignoring encryptedWith for now', encryptedWith)
  const response = await fetch(cidUrl(cid))
  return await response.arrayBuffer()
}
