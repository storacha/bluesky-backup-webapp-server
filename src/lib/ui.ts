// copied from console

import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { UnknownLink } from '@storacha/ui-react'

import { ExtendedRepoEntry, NormalizedPost, ProfileData } from '@/types'

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

// there's a subtle mismatch between @atcute/car data for normal posts, and
// the post data from bsky when dealing with reposts. these functions below
// should help us ensure that the data structures required by UI components are similar
export const normalizeRepoEntry = (
  entry: ExtendedRepoEntry,
  profile?: ProfileData
): NormalizedPost => {
  return {
    id: entry.rkey || crypto.randomUUID(),
    text: entry.record.text,
    createdAt: entry.record.createdAt,
    author: {
      handle: profile?.handle || 'unknown',
      displayName: profile?.displayName || profile?.handle || 'Unknown User',
    },
    embed: entry.record.embed,
    isRepost: entry.isRepost || entry.collection === 'app.bsky.feed.repost',
  }
}

export const normalizePostView = (post: PostView): NormalizedPost => {
  return {
    id: post.uri.split('/').pop() || crypto.randomUUID(),
    // @ts-expect-error the property in `record` is of type `[x: string]: unknown` we know the record has text
    text: post.record.text || '',
    createdAt: post.indexedAt,
    author: {
      handle: post.author.handle,
      displayName: post.author.displayName || post.author.handle,
    },
    /* @ts-expect-error the embed property expects it to be $Typed<View>. where View could be any one of AppBskyEmbedVideo, AppBskyEmbedRecord... but the propblem now is $Typed is an internal type(?)/generic helper from the type-def internally so i couldn't exactly import it. */
    embed: post.embed,
    isRepost: false,
  }
}
