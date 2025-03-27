import React from 'react'
import type { Preview } from '@storybook/react'
import { dmSans, epilogue } from '../src/app/globalStyle'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        className={`${dmSans.className} ${dmSans.variable} ${epilogue.variable}`}
      >
        <Story />
      </div>
    ),
  ],
}

export default preview
