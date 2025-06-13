import { iterateAtpRepo } from '@atcute/car'
import { useCallback, useEffect, useState } from 'react'

import { loadCid } from '@/lib/storacha'
import { ExtendedRepoEntry, State } from '@/types'

export type RepoParams = {
  cid: string
}

type ParsedRepo = {
  posts: ExtendedRepoEntry[]
}

const parseRepo = async (car: Uint8Array): Promise<ParsedRepo> => {
  try {
    const entries = [...iterateAtpRepo(car)] as ExtendedRepoEntry[]

    const posts = entries
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

    return {
      posts,
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
