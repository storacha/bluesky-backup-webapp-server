import { DetailedHTMLProps, HTMLAttributes } from 'react'

// we need this because `selectedcontent` isn't avalaible in JSX yet(?)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      selectedcontent: DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      >
    }
  }
}

export {}
