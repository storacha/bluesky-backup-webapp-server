import { styled } from 'next-yak'
import { Property } from 'csstype'

export const Center = styled.div<{ $height?: Property.Height }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${({ $height = '' }) => $height};
`
