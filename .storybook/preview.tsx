import { NuqsAdapter } from 'nuqs/adapters/next/app'
import React, { CSSProperties } from 'react'

// eslint-disable-next-line import/no-restricted-paths -- This one we need.
import { dmMono, dmSans, epilogue } from '../src/app/globalStyle'

import type { Decorator, Preview } from '@storybook/react'

const withFonts: Decorator = (Story) => {
  const addFonts = (div: HTMLDivElement | null) => {
    if (div) {
      div.ownerDocument.documentElement.classList.add(
        dmSans.className,
        dmSans.variable,
        dmMono.variable,
        epilogue.variable
      )
    }
  }
  return (
    <div ref={addFonts}>
      <Story />
    </div>
  )
}

const withNuqs: Decorator = (Story) => (
  <NuqsAdapter>
    <Story />
  </NuqsAdapter>
)

declare module '@storybook/react' {
  interface Parameters {
    parentSize?: {
      width?: CSSProperties['width']
    }
  }
}

const withParentSize: Decorator = (Story, { parameters: { parentSize } }) =>
  parentSize ? (
    <div style={{ width: parentSize.width }}>
      <Story />
    </div>
  ) : (
    <Story />
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
  decorators: [withFonts, withNuqs, withParentSize],
}

export default preview
