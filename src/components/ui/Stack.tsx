import { css, styled } from 'next-yak'
import { Property } from 'csstype'

export const Stack = styled.div<{
  $direction?: Property.FlexDirection
  $gap?: Property.Gap
  $even?: boolean
  $alignItems?: Property.AlignItems
}>`
  display: flex;
  flex-direction: ${({ $direction = 'column' }) => $direction};
  gap: ${({ $gap = 0 }) => $gap};
  align-items: ${({ $alignItems = '' }) => $alignItems};

  ${({ $even }) =>
    $even &&
    css`
      & > * {
        flex: 1 1 0;
      }
    `}
`
