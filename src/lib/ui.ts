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
  back: number = 3
): string {
  return `${text.slice(0, front)}…${text.slice(-back)}`
}

export function formatDate(date: string) {
  return new Date(date).toLocaleString()
}

export function shortenIfOver(
  text: string,
  maxLength: number = 15,
  front: number = 6,
  back: number = 6
): string {
  if (!text || text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, front)}…${text.slice(-back)}`
}
