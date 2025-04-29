import { Account, Client, Space } from '@w3ui/react'
import { GATEWAY_HOSTNAME } from './constants'

interface StorachaProps {
  account?: Account
  client?: Client
  spaces?: Space[]
}

export function cidUrl(cid: string) {
  return `https://${cid}.${GATEWAY_HOSTNAME}`
}
