'use client'

import { Agent } from '@atproto/api'
import React from 'react'
import { BareFetcher, SWRConfig } from 'swr'

const fetchers: Record<string, BareFetcher> = {
  async api(resource, queryParams: Record<string, string> = {}) {
    const queryString = new URLSearchParams(queryParams).toString()
    const url = queryString ? `${resource}?${queryString}` : resource
    return fetch(url).then((res) => res.json())
  },
  async 'atproto-handle'(did: string) {
    const agent = new Agent({
      service: 'https://public.api.bsky.app/',
    })
    const {
      data: { handle },
    } = await agent.app.bsky.actor.getProfile({
      actor: did,
    })
    return handle
  },
}

export default function SWRConfigProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SWRConfig
      value={{
        async fetcher(resource) {
          if (typeof resource === 'string') {
            resource = ['api', resource]
          }
          const [type, ...args] = resource
          if (typeof type !== 'string') {
            throw new Error(`Invalid resource type "${type}"`)
          }
          const fetcher = fetchers[type]
          if (!fetcher) {
            throw new Error(`No fetcher for type "${type}"`)
          }
          return fetcher(...args)
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}
