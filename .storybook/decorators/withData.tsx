import { Decorator } from '@storybook/react'
import { SWRConfig } from 'swr'

export const withData = (data: Record<string, unknown>): Decorator =>
  function WithDataDecorator(Story) {
    return (
      <SWRConfig
        value={{
          // Provide a local cache, so it doesn't persist between stories.
          provider: () => new Map(),
          async fetcher(resource) {
            if (resource in data) {
              return data[resource]
            } else {
              throw new Error(`No data given in story for ${resource}`)
            }
          },
        }}
      >
        <Story />
      </SWRConfig>
    )
  }
