import { css, styled } from 'next-yak'

export const Stack = styled.div<{
  $direction?: 'row' | 'column'
  $gap?: string
  $even?: boolean
}>`
  display: flex;
  flex-direction: ${({ $direction = 'column' }) => $direction};
  gap: ${({ $gap = 0 }) => $gap};

  ${({ $even }) =>
    $even &&
    css`
      & > * {
        flex: 1 1 0;
      }
    `}
`
