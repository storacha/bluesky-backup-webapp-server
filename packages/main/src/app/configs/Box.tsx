import { roundRectStyle } from '@/components/ui'
import { styled } from 'next-yak'

export const Box: React.FC<{ children: React.ReactNode }> = styled.div`
  ${roundRectStyle}
  border-color: var(--color-gray-light);
  background-color: var(--color-white);

  /* TK: This seems unwise. We need this to force things to line up, but really
  we need a better strategy for these boxes changing size. */
  overflow: hidden;
`
