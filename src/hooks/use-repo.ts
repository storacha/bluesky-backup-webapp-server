import { iterateAtpRepo } from '@atcute/car'
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { useCallback, useEffect, useState } from 'react'

import { loadCid } from '@/lib/storacha'
import { ExtendedRepoEntry, State } from '@/types'

export type RepoParams = {
  cid: string
}

type ParsedRepo = {
  posts: ExtendedRepoEntry[]
}

// reposted records do not have the same data shape as the normal ones (from the repo CAR) in
// the app.bsky.feed.post collection so we need to get it using the ATUri
const getRecord = async (uri: string): Promise<FeedViewPost | null> => {
  try {
    const response = await fetch(`/api/record?uri=${uri}`)
    const record = await response.json()
    return record.posts?.[0]
  } catch (error) {
    console.error(error)
    return null
  }
}

const parseRepo = async (car: Uint8Array): Promise<ParsedRepo> => {
  try {
    const entries = [...iterateAtpRepo(car)] as ExtendedRepoEntry[]

    const filteredEntries = entries
      .filter(
        (entry) =>
          entry.collection === 'app.bsky.feed.post' ||
          entry.collection === 'app.bsky.feed.repost'
      )
      .sort((a, b) => {
        const dateA = new Date(a.record.createdAt || 0)
        const dateB = new Date(b.record.createdAt || 0)
        return dateB.getTime() - dateA.getTime()
      })

    const processedPosts = await Promise.all(
      filteredEntries.map(async (entry) => {
        if (entry.collection === 'app.bsky.feed.repost') {
          const repostedRecord = await getRecord(
            String(entry.record.subject?.uri)
          )
          if (repostedRecord) {
            return {
              ...entry,
              ...repostedRecord,
              isRepost: true,
            }
          }
        }
        return entry
      })
    )

    return {
      posts: processedPosts.filter(Boolean) as ExtendedRepoEntry[],
    }
  } catch (error) {
    console.error('Error parsing repo:', error)
    return {
      posts: [],
    }
  }
}

export const useRepo = ({ cid }: RepoParams) => {
  const [state, setState] = useState<State>('idle')
  const [parsedRepo, setParsedRepo] = useState<ParsedRepo>({
    posts: [],
  })

  const getRepo = useCallback(async (cidToLoad: string) => {
    if (!cidToLoad) {
      console.log('No CID provided. Skipping!')
      return
    }

    try {
      setState('loading')
      const data = await loadCid(cidToLoad)
      const repoData = new Uint8Array(data)
      const parsed = await parseRepo(repoData)
      setParsedRepo(parsed)
    } catch (error) {
      console.error('Error fetching or parsing repo:', error)
    } finally {
      setState('idle')
    }
  }, [])

  useEffect(() => {
    if (cid) getRepo(cid)
  }, [cid, getRepo])

  return {
    getRepo,
    repo: parsedRepo,
    loading: state === 'loading',
  }
}
