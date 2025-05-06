import { iterateAtpRepo } from '@atcute/car'
import { useCallback, useEffect, useState } from 'react'

import { loadCid } from '@/lib/storacha'
import { ExtendedRepoEntry } from '@/types'

export type RepoParams = {
  cid: string
}

type State = 'loading' | 'idle'

export const useRepo = ({ cid }: RepoParams) => {
  const [repo, setRepo] = useState<Uint8Array | null>(null)
  const [parsedRepo, setParsedRepo] = useState<ExtendedRepoEntry[]>([])
  const [state, setState] = useState<State>('idle')

  const sortByCreatedAtDesc = (entries: ExtendedRepoEntry[]) => {
    return entries.sort((a, b) => {
      const dateA = new Date(a.record?.createdAt || 0)
      const dateB = new Date(b.record?.createdAt || 0)
      return dateB.getTime() - dateA.getTime()
    })
  }

  const posts = sortByCreatedAtDesc(
    parsedRepo.filter((repo) => repo.collection === 'app.bsky.feed.post')
  )
  const likes = sortByCreatedAtDesc(
    parsedRepo.filter((repo) => repo.collection === 'app.bsky.feed.like')
  )
  const follows = sortByCreatedAtDesc(
    parsedRepo.filter((repo) => repo.collection === 'app.bsky.graph.follow')
  )
  const reposts = sortByCreatedAtDesc(
    parsedRepo.filter((repo) => repo.collection === 'app.bsky.feed.repost')
  )
  const postsWithEmbeds = posts.filter(
    (post) => post.record && post.record.embed !== undefined
  )

  const externalEmbed = postsWithEmbeds.filter(
    (post) => post.record.embed?.$type === 'app.bsky.embed.external'
  )
  const imageEmbeds = postsWithEmbeds.filter(
    (post) => post.record.embed?.$type === 'app.bsky.embed.images'
  )
  const quoteEmbeds = postsWithEmbeds.filter(
    (post) => post.record.embed?.$type === 'app.bsky.embed.record'
  )

  useEffect(() => {
    const parseRepoData = async () => {
      if (!repo || !cid) return

      try {
        setState('loading')
        const repoData = [...iterateAtpRepo(repo)]
        setParsedRepo(repoData as ExtendedRepoEntry[])
      } catch (error) {
        console.error('Error parsing repo', error)
      } finally {
        setState('idle')
      }
    }

    parseRepoData()
  }, [repo, cid])

  const getRepo = useCallback(async (cidToLoad: string) => {
    if (!cidToLoad) {
      console.log('No CID provided, skipping!')
      return
    }

    try {
      setState('loading')
      const data = await loadCid(cidToLoad)
      setRepo(new Uint8Array(data))
    } catch (error) {
      console.error('Error fetching repo:', error)
    } finally {
      setState('idle')
    }
  }, [])

  useEffect(() => {
    if (cid) {
      getRepo(cid)
    }
  }, [cid, getRepo])

  return {
    getRepo,
    repo: {
      posts: posts,
      likes: likes,
      follows: follows,
      reposts: reposts,
      embeds: {
        external: externalEmbed,
        withImages: imageEmbeds,
        withQuotes: quoteEmbeds,
      },
    },
    loading: state === 'loading',
  }
}
