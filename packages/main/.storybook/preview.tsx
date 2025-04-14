import React from 'react'
import type { Preview } from '@storybook/react'
import { dmMono, dmSans, epilogue } from '../src/app/globalStyle'

const withFonts = (Story) => (
  <div
    className={`${dmSans.className} ${dmSans.variable} ${dmMono.variable} ${epilogue.variable}`}
  >
    <Story />
  </div>
)
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [withFonts],
}

export default preview
