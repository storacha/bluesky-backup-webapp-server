import { styled } from 'next-yak'

import { StyleProps } from './style'

export const Center = styled.div<Partial<StyleProps>>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ $width = '' }) => $width};
  height: ${({ $height = '' }) => $height};
`
