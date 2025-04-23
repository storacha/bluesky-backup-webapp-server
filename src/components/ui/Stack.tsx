import { css, styled } from 'next-yak'
import { Property } from 'csstype'

export const Stack = styled.div<{
  $direction?: Property.FlexDirection
  $gap?: Property.Gap
  $justifyContent?: Property.JustifyContent
  $even?: boolean
  $alignItems?: Property.AlignItems
  $wrap?: Property.FlexWrap
  $width?: Property.Width  
}>`
  display: flex;
  flex-direction: ${({ $direction = 'column' }) => $direction};
  justify-content: ${({$justifyContent = 'flex-start'}) => $justifyContent};
  gap: ${({ $gap = 0 }) => $gap};
  align-items: ${({ $alignItems = '' }) => $alignItems};
  flex-wrap: ${({ $wrap = '' }) => $wrap};
  width: ${({ $width = '' }) => $width};

  ${({ $even }) =>
    $even &&
    css`
      & > * {
        flex: 1 1 0;
      }
    `}
`
