import React from 'react'
import type { Preview } from '@storybook/react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { dmMono, dmSans, epilogue } from '../src/app/globalStyle'

const withFonts = (Story) => (
  <div
    className={`${dmSans.className} ${dmSans.variable} ${dmMono.variable} ${epilogue.variable}`}
  >
    <Story />
  </div>
)

const withNuqs = (Story) => (
  <NuqsAdapter>
    <Story />
  </NuqsAdapter>
)

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      // Use the (stub) App Router.
      appDirectory: true,
    },
  },
  decorators: [withFonts, withNuqs],
}

export default preview
