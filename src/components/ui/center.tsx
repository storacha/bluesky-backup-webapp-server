import { Property } from 'csstype'
import { styled } from 'next-yak'

export const Center = styled.div<{ $height?: Property.Height }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${({ $height = '' }) => $height};
`
