// copied from console

import { UnknownLink } from '@storacha/ui-react'

export function shortenCID(cid: UnknownLink | string) {
  return shorten(cid.toString(), 5, 4)
}

export function shortenDID(did: string) {
  return shorten(did, 14, 4)
}

export function shorten(
  text: string,
  front: number = 3,
  back: number = 3,
  maxLength: number = 15
): string {
  return `${text?.slice(0, text.length > maxLength ? 8 : front)}…${text?.slice(text.length > maxLength ? -7 : -back)}`
}

export function formatDate(date: string) {
  return new Date(date).toLocaleString()
}
