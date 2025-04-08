import { Decorator } from '@storybook/react'
import { linkTo } from '@storybook/addon-links'

export const withLinks = (
  data: Record<string, Parameters<typeof linkTo>>
): Decorator =>
  function WithLinksDecorator(Story) {
    return (
      <div
        onClickCapture={(e) => {
          if (e.target instanceof HTMLAnchorElement) {
            e.preventDefault()
            const href = e.target.getAttribute('href')
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
