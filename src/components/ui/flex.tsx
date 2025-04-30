import { styled } from 'next-yak'
import { StyleProps } from './style'

export const Flex = styled.div<Partial<StyleProps>>`
  height: ${({ $height = '66px' }) => $height};
  width: ${({ $width = '100%' }) => $width};
  display: flex;
  justify-content: space-between;
  align-items: ${({ $alignItems = '' }) => $alignItems};
  padding: ${({ $padding = '0 0.6rem' }) => $padding};
  gap: ${({ $gap = 0 }) => $gap};
  cursor: pointer;
  background: ${({ $background = '' }) => $background};
`
