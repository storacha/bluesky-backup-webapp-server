import { Account, Client, Space } from '@storacha/ui-react'
import { GATEWAY_HOSTNAME } from './constants'

export interface StorachaProps {
  account?: Account
  client?: Client
  spaces?: Space[]
}

export function cidUrl (cid: string) {
  return `https://${cid}.${GATEWAY_HOSTNAME}`
}

export async function uploadCAR (storachaClient: Client, blob: Blob): Promise<string> {
  let storachaRepoCid;
  await storachaClient.uploadCAR(blob, {
    onShardStored: (carMetadata) => {
      storachaRepoCid = carMetadata.cid
    },
    // set shard size to 4 GiB - the maximum shard size
    shardSize: 1024 * 1024 * 1024 * 4,
  })
  if (!storachaRepoCid) throw new Error("Uploaded CAR but did not get shard ID, this is unexpected.")
  return storachaRepoCid
}