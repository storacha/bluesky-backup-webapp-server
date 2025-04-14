import { css, styled } from 'next-yak'
import { Property } from 'csstype'

export const Stack = styled.div<{
  $direction?: Property.FlexDirection
  $gap?: Property.Gap
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
