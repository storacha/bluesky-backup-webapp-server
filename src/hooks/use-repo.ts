import { iterateAtpRepo } from '@atcute/car'
import { Did } from '@atproto/api'
import { useCallback, useEffect, useState } from 'react'

import { loadCid } from '@/lib/storacha'
import { ExtendedRepoEntry } from '@/types'

export type RepoParams = {
  cid: string
}

type State = 'loading' | 'idle'

type ParsedRepo = {
  posts: ExtendedRepoEntry[]
  authorDid: Did | null
}

const parseRepo = (car: Uint8Array): ParsedRepo => {
  try {
    const entries = [...iterateAtpRepo(car)] as ExtendedRepoEntry[]

    const posts = entries
      .filter((entry) => entry.collection === 'app.bsky.feed.post')
      .sort((a, b) => {
        const dateA = new Date(a.record.createdAt || 0)
        const dateB = new Date(b.record.createdAt || 0)
        return dateB.getTime() - dateA.getTime()
      })

    let authorDid: string | null = ''
    for (const post of posts) {
      if (post.uri) {
        // does a DID look up in the post URI
        const match = post.uri.match(/at:\/\/(did:[^\/]+)/)
        if (match && match[1]) {
          authorDid = match[1]
          break
        }
      }
    }

    return {
      posts,
      authorDid: authorDid as Did,
    }
  } catch (error) {
    console.error(error)
    return {
      posts: [],
      authorDid: null,
    }
  }
}

export const useRepo = ({ cid }: RepoParams) => {
  const [state, setState] = useState<State>('idle')
  const [parsedRepo, setParsedRepo] = useState<ParsedRepo>({
    posts: [],
    authorDid: null,
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
      const parsed = parseRepo(repoData)
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
