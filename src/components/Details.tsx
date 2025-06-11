import { styled } from 'next-yak'

import { Stack, SubHeading } from './ui'

export const Details = styled(Stack)``

export const DetailName = styled(SubHeading)`
  color: black;
`

export const DetailValue = styled.div`
  font-family: var(--font-dm-mono);
  font-size: 0.75rem;
`
