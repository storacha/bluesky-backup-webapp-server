import { ArrowPathIcon } from '@heroicons/react/20/solid'
import { keyframes, styled } from 'next-yak'

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

export const Loader = styled(ArrowPathIcon)`
  display: block;
  animation: ${spin} 2s linear infinite;
  width: 3rem;
`

export const FullscreenLoader = () => (
  <FullscreenForLoader>
    <Loader />
  </FullscreenForLoader>
)
