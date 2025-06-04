import { Decorator } from '@storybook/react'
import { SWRConfig, unstable_serialize } from 'swr'

import { FetchedData, Key } from '@/lib/swr'

type MaybeError<T> = T | Error
type MaybePromise<T> = MaybeError<T> | Promise<MaybeError<T>>
type MaybePromiseFunction<T> = ((data: T) => MaybePromise<T>) | MaybePromise<T>

/**
 * Returns (the resolved value of) {@link value}, unless it's an `Error`, in
 * which case it throws that error.
 */
const returnOrThrow = async <T,>(value: MaybePromise<T>): Promise<T> => {
  const resolved = await value
  if (resolved instanceof Error) {
    throw resolved
  } else {
    return resolved
  }
}

/**
 * Provides data which can be fetched with SWR in the story.
 */
export const withData = <K extends Key>(
  /**
   * The key to fetch data for. This is the first argument to `useSWR`.
   */
  key: K,
  /**
   * The data to return for the key. Or, a function which receives the data from
   * an earlier `withData` and returns modified data.
   */
  dataOrFunction: MaybePromiseFunction<FetchedData<K>>
): Decorator =>
  function WithDataDecorator(Story, ctx) {
    return (
      <SWRConfig
        value={(parentConfig) => {
          return {
            ...parentConfig,

            // Provide a fresh cache per story (but use that one for the whole
            // story), so data doesn't persist between stories.
            provider:
              parentConfig?.provider ??
              (() => {
                return new Map()
              }),

            fetcher(fetchedKey: typeof key) {
              const parentFetcher = parentConfig?.fetcher
              const isMatch =
                unstable_serialize(fetchedKey) === unstable_serialize(key)

              if (isMatch) {
                if (typeof dataOrFunction === 'function') {
                  if (!parentFetcher) {
                    const error = new Error(
                      `withData in ${ctx.title} (${ctx.name}) for ${JSON.stringify(
                        fetchedKey
                      )} expected to modify data, but no earlier withData was found`
                    )
                    // Make sure this error is visible, even if SWR swallows it.
                    console.error(error)
                    throw error
                  }
                  return (async () =>
                    returnOrThrow(
                      dataOrFunction(await parentFetcher(fetchedKey))
                    ))()
                } else {
                  return returnOrThrow(dataOrFunction)
                }
              } else if (parentFetcher) {
                return parentFetcher(fetchedKey)
              } else {
                const error = new Error(
                  `No fetcher given in story ${ctx.title} (${ctx.name}) for ${JSON.stringify(fetchedKey)}`
                )
                // Make sure this error is visible, even if SWR swallows it.
                console.error(error)
                throw error
              }
            },
          }
        }}
      >
        <Story />
      </SWRConfig>
    )
  }
