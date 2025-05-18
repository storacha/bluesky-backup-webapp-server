'use client'

import { Agent } from '@atproto/api'
import { Account } from '@storacha/ui-react'
import React from 'react'
import useSWRBase, { SWRConfig, SWRConfiguration, SWRResponse } from 'swr'
import useSWRMutationBase, { MutationFetcher } from 'swr/mutation'

import {
  ATBlob,
  Backup,
  PaginatedResult,
  ProfileData,
  RotationKey,
  Snapshot,
} from '@/types'

// This type defines what's fetchable with `useSWR`. It is a union of key/data
// pairs. The key can match a pattern by being as wide as it needs to be.
type Fetchable =
  | [['api', '/session/did', Record<never, string>?], string]
  | [['api', '/api/backups', Record<string, string>?], Backup[]]
  | [
      [
        'api',
        `/api/backups/${string}/snapshots`,
        { page?: string; limit?: string }?,
        Record<string, string>?,
      ],
      PaginatedResult<Snapshot>,
    ]
  | [['api', `/api/backups/${string}/blobs`, Record<string, string>?], ATBlob[]]
  | [['api', `/api/snapshots/${string}`, Record<string, string>?], Snapshot]
  | [
      ['api', `/api/snapshots/${string}/blobs`, Record<string, string>?],
      ATBlob[],
    ]
  | [['api', '/api/atproto-accounts', Record<string, string>?], string[]]
  | [['api', '/api/keys', Record<string, string>?], RotationKey[]]
  | [
      ['api', `/api/profile?did=${string}`, Record<string, string>?],
      ProfileData,
    ]
  | [['atproto-handle', string], string]
  | [['storacha-plan', Account], string | undefined]

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

    const response = await fetch(url)
    if (response.status == 200) {
      // We haven't added any validation to the API responses, so we have to
      // assume they're correct with `any`.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (await response.json()) as any
    } else {
      throw new Error(await response.text())
    }
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

  async 'storacha-plan'(account) {
    const { ok: planName } = await account.plan.get()
    return planName?.product
  },
}

/**
 * Exactly the same as `useSWR`, but typed to only accept the keys supported by
 * our fetchers and config. Also, logs any errors to the console.
 */
export const useSWR = <K extends Key>(
  key: K | null | undefined,
  config?: SWRConfiguration
): SWRResponse<FetchedData<K>> => {
  const swrResponse = useSWRBase(key, config)
  if (swrResponse.error) {
    console.error('SWR error:', swrResponse.error)
  }
  return swrResponse
}

/**
 * Exactly the same as `useSWRMutation`, but typed to only accept the keys
 * supported by our fetchers and config, and the options object is not currently
 * supported. (It could be, but the types take some effort, and we haven't hit a
 * use for it so far.) Also, logs any errors to the console.
 */
export const useSWRMutation = <
  Data = unknown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Matches useSWRMutationBase
  Error = unknown,
  SWRMutationKey extends Key = Key,
  ExtraArg = never,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Matches useSWRMutationBase
  SWRData = Data,
>(
  key: SWRMutationKey | null | undefined,
  fetcher: MutationFetcher<Data, SWRMutationKey, ExtraArg>
) => {
  const swrResponse = useSWRMutationBase(key, fetcher)
  if (swrResponse.error) {
    console.error('SWR mutation error:', swrResponse.error)
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
