import { GATEWAY_HOSTNAME } from './constants'

export function cidUrl(cid: string) {
  return `https://${cid}.${GATEWAY_HOSTNAME}`
}
