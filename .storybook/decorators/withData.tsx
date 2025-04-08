import { FetchedData, Key } from '@/app/swr'
import { Decorator } from '@storybook/react'
import { SWRConfig, unstable_serialize } from 'swr'

export const withData = <K extends Key>(
  key: K,
  data: Promise<FetchedData<K>> | FetchedData<K>
): Decorator =>
  function WithDataDecorator(Story) {
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
              if (unstable_serialize(fetchedKey) === unstable_serialize(key)) {
                return data
              } else if (parentConfig?.fetcher) {
                return parentConfig.fetcher(fetchedKey)
              } else {
                const error = new Error(
                  `No fetcher given in story for ${JSON.stringify(fetchedKey)}`
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
