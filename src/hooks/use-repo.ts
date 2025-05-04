import { iterateAtpRepo } from '@atcute/car'
import AtpAgent from '@atproto/api'
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { useCallback, useEffect, useState } from 'react'

import { ExtendedRepoEntry } from '@/app/types'

import { useAtpAgent } from './use-atp-agent'

export type RepoParams = {
  did: string
}

type State = 'loading' | 'idle'

export const useRepo = ({ did }: RepoParams) => {
  const agent = useAtpAgent()
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
      if (repo && did) {
        try {
          setState('loading')
          console.log('Parsing repo data for DID:', did)
          const repoData = [...iterateAtpRepo(repo)]
          console.log("Parsed repo data:", repoData)
          setParsedRepo(repoData as ExtendedRepoEntry[])
        } catch (error) {
          console.error('Error parsing repo', error)
        } finally {
          setState('idle')
        }
      }
    }

    parseRepoData()
  }, [repo, did])

  const getRepo = useCallback(
    async (did: string) => {
      if (!did || !agent) {
        console.log('Missing DID or agent:', { did, hasAgent: !!agent })
        return
      }

      try {
        setState('loading')
        console.log('Fetching repo for DID:', did)
        const data = await agent.com.atproto.sync.getRepo({ did })
        console.log('Repo data received:', !!data?.data)
        setRepo(data?.data || null)
      } catch (error) {
        console.error('Error fetching repo:', error)
        setState('idle')
      }
    },
    [agent]
  )

  useEffect(() => {
    if (did && agent && !repo) {
      console.log('Triggering repo fetch for DID:', did)
      getRepo(did)
    }
  }, [did, agent, repo, getRepo])

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

export const useQuotedPost = ({
  posts,
  agent,
}: {
  agent: AtpAgent
  posts: ExtendedRepoEntry[]
}) => {
  const [quotedContent, setQuotedContent] = useState<Record<string, PostView>>(
    {}
  )

  const postsWithEmbeds = posts.filter(
    (post) => post.record && post.record.embed !== undefined
  )

  const quotedPostUris = postsWithEmbeds
    .filter((post) => post.record.embed?.$type === 'app.bsky.embed.record')
    // @ts-expect-error there should be a relationship with PostView and Post in utils/types.ts
    // i'll address this later
    .map((post) => post?.record?.embed?.record.uri)

  const getQuotedContent = useCallback(
    async (uris: string[]) => {
      if (uris.length === 0) return

      try {
        const res = await agent.api.app.bsky.feed.getPosts({ uris })

        const newQuotedContent = { ...quotedContent }
        res.data.posts.forEach((post) => {
          newQuotedContent[post.uri] = post
        })

        setQuotedContent(newQuotedContent)
      } catch (error) {
        console.error('Error fetching quoted posts:', error)
      }
    },
    [agent.api.app.bsky.feed, quotedContent]
  )

  useEffect(() => {
    const urisToFetch = quotedPostUris.filter((uri) => !quotedContent[uri])
    if (urisToFetch.length > 0) {
      getQuotedContent(urisToFetch)
    }
  }, [quotedPostUris, getQuotedContent, quotedContent])

  return {
    quotedContent,
    postsWithEmbeds,
  }
}
