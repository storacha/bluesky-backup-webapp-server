import { Decorator } from '@storybook/react'
import { linkTo } from '@storybook/addon-links'

export const withLinks = (
  data: Record<string, Parameters<typeof linkTo>>
): Decorator =>
  function WithLinksDecorator(Story) {
    return (
      <div
        onClickCapture={(e) => {
          const link = e.target instanceof Element && e.target.closest('a')
          if (link) {
            e.preventDefault()
            const href = link.getAttribute('href')
            if (href && data[href]) {
              linkTo(...data[href])()
            } else {
              throw new Error(`No link given in story for ${href}`)
            }
          }
        }}
      >
        <Story />
      </div>
    )
  }
