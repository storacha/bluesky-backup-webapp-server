'use client'

import { Agent } from '@atproto/api'
import React from 'react'
import useSWRBase, { SWRConfig, SWRResponse } from 'swr'
import { BackupConfig } from './types'

// This type defines what's fetchable with `useSWR`. It is a union of key/data
// pairs. The key can match a pattern by being as wide as it needs to be.
type Fetchable =
  | [['api', '/api/backup-configs', Record<string, string>?], BackupConfig[]]
  | [['api', '/api/atproto-accounts', Record<string, string>?], string[]]
  | [['atproto-handle', string], string]

export type Key = Fetchable extends [infer T, unknown] ? T : never

export type FetchedData<Args extends Key> = {
  [Each in Fetchable as 'data']: Each extends [infer T, infer U]
    ? Args extends T
      ? U
      : never
    : never
}['data']

// This is a bit of dark TypeScript magic, and it relies on `any` for some
// special behavior. https://stackoverflow.com/a/50375286/4937
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I
) => void
  ? I
  : never

type Fetchers = {
  [Each in Fetchable as Each extends [
    [infer FetcherName, ...unknown[]],
    unknown,
  ]
    ? FetcherName
    : never]: Each extends [[unknown, ...infer Args], infer Data]
    ? (...args: Args) => Promise<Data> | Data
    : never
} extends infer O
  ? { [K in keyof O]: UnionToIntersection<O[K]> }
  : never

const fetchers: Fetchers = {
  /**
   * Makes a GET request to the app's API. Expects a JSON response.
   * @param resource The endpoint to fetch from.
   * @param queryParams Optional query parameters to include in the request.
   */
  async api(resource, queryParams) {
    const queryString = new URLSearchParams(queryParams).toString()
    const url = queryString ? `${resource}?${queryString}` : resource

    // We haven't added any validation to the API responses, so we have to
    // assume they're correct with `any`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return fetch(url).then((res) => res.json()) as any
  },

  /**
   * Fetches the Bluesky handle for a given DID.
   * @param did The DID to fetch the handle for.
   */
  async 'atproto-handle'(did) {
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

export const useSWR = <K extends Key>(
  key: K | null | undefined
): SWRResponse<FetchedData<K>> => {
  const swrResponse = useSWRBase(key)
  if (swrResponse.error) {
    console.error('SWR error:', swrResponse.error)
  }
  return swrResponse
}

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
