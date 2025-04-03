'use client'

import { Agent } from '@atproto/api'
import React from 'react'
import useSWRBase, { BareFetcher, SWRConfig, SWRResponse } from 'swr'

interface API {
  '/api/backup-configs': { backupConfigs: string[] }
}

const fetchers = {
  /**
   * Makes a GET request to the app's API. Expects a JSON response.
   * @param resource The endpoint to fetch from.
   * @param queryParams Optional query parameters to include in the request.
   */
  async api(
    resource: keyof API,
    queryParams: Record<string, string> = {}
  ): Promise<API[typeof resource]> {
    const queryString = new URLSearchParams(queryParams).toString()
    const url = queryString ? `${resource}?${queryString}` : resource
    return fetch(url).then((res) => res.json())
  },

  /**
   * Fetches the Bluesky handle for a given DID.
   * @param did The DID to fetch the handle for.
   */
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
} satisfies Record<string, BareFetcher>

type Key = {
  [Type in keyof typeof fetchers]: [
    Type,
    ...Parameters<(typeof fetchers)[Type]>,
  ]
}[keyof typeof fetchers]

export const useSWR = <K extends Key>(
  key: K
): SWRResponse<Awaited<ReturnType<(typeof fetchers)[K[0]]>>> => useSWRBase(key)

export function SWRConfigProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        // NB: This is not declared `async`! The errors thrown here represent
        // mistakes, not handleable errors, and should present in development as
        // big obvious errors, thus they must be thrown synchronously, before
        // the fetching promise even begins. Errors thrown in the fetcher itself
        // will appear as the `error` property of the response.
        fetcher([type, ...args]: Key) {
          if (!fetchers[type]) {
            throw new Error(`No fetcher for type "${type}"`)
          }
          const fetcher = fetchers[type]
          // @ts-expect-error We can't prove that `args` fits the fetcher here,
          // but we should only get valid args through the custom `useSWR` hook.
          return fetcher(...args)
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}
