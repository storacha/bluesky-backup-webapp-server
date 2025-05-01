import { ArrowPathIcon } from '@heroicons/react/20/solid'
import { keyframes, styled } from 'next-yak'

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

export const Loader = styled(ArrowPathIcon)`
  display: block;
  animation: ${spin} 2s linear infinite;
  width: 3rem;
`
