import { ArrowPathIcon } from '@heroicons/react/20/solid'
import { keyframes, styled } from 'next-yak'

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- For JSDoc
import type { Spinner } from './ui'

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

const FullscreenForLoader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;

  background-color: var(--color-gray-light);
`

/**
 * A large spinner, used for loading pages and sections of pages. For an
 * indeterminate progress indicator for buttons and other small UI elements, use
 * {@link Spinner}. For a fullscreen loading indicator (or to fill other large
 * areas), use {@link FullscreenLoader}.
 */
export const Loader = styled(ArrowPathIcon)`
  display: block;
  animation: ${spin} 2s linear infinite;
  width: 3rem;
`

/**
 * Like {@link Loader}, but fills the entire screen, or other large area, such
 * as a panel. Expects to be rendered inside a flex container.
 */
export const FullscreenLoader = () => (
  <FullscreenForLoader>
    <Loader />
  </FullscreenForLoader>
)
