import { css, styled } from 'next-yak'

import { StyleProps } from './style'

export const Stack = styled.div<{ $even?: boolean } & Partial<StyleProps>>`
  display: flex;
  flex-direction: ${({ $direction = 'column' }) => $direction};
  justify-content: ${({ $justifyContent = 'flex-start' }) => $justifyContent};
  gap: ${({ $gap = 0 }) => $gap};
  align-items: ${({ $alignItems = '' }) => $alignItems};
  flex-wrap: ${({ $wrap = '' }) => $wrap};
  width: ${({ $width = '' }) => $width};
  height: ${({ $height = '' }) => $height};
  border-bottom: ${({ $borderBottom = '' }) => $borderBottom};
  border: ${({ $border = '' }) => $border};
  align-items: ${({ $alignItems = '' }) => $alignItems};

  ${({ $even }) =>
    $even &&
    css`
      & > * {
        flex: 1 1 0;
      }
    `}
`
