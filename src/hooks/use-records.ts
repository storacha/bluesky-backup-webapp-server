import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { useCallback, useEffect, useState } from 'react'

import { State } from '@/types'

export const useRecord = (uri: string) => {
  const [state, setState] = useState<State>('idle')
  const [record, setRecord] = useState<PostView>()

  const getRecord = useCallback(
    async (uriToLoad: string) => {
      if (!uriToLoad) return

      try {
        setState('loading')
        // just incase we try to send list of uris [uri1, uri2,...]
        const cleanedUri = uri.replace(/[\[\]]/g, '').trim()
        const xrpcUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPosts?uris=${cleanedUri}`
        const response = await fetch(xrpcUrl)
        const data = await response.json()
        setRecord(data.posts?.[0])
      } catch (error) {
        console.error(error)
      } finally {
        setState('idle')
      }
    },
    [uri]
  )

  useEffect(() => {
    if (uri) getRecord(uri)
  }, [uri, getRecord])

  return {
    record,
    getRecord,
    loading: state === 'loading',
  }
}
