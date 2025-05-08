import { css, styled } from 'next-yak'

import { StyleProps } from './style'

export const roundRectStyle = css`
  border-radius: 0.75rem;
  padding: calc(1rem - 1px);
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
`

export const Container = styled.div`
  padding: 3.4rem 3.2em;
`

export const Box = styled.div<Partial<StyleProps & { $isFocused?: boolean }>>`
  border-width: ${({ $borderWidth = '1px', $isFocused }) =>
    $isFocused ? '2px' : $borderWidth};
  border-style: ${({ $borderStyle = 'dashed', $isFocused }) =>
    $isFocused ? 'solid' : $borderStyle};
  border-color: ${({ $borderColor = 'var(--color-gray-light)', $isFocused }) =>
    $isFocused ? 'var(--color-dark-blue)' : $borderColor};
  border-radius: 12px;
  height: ${({ $height = '66px' }) => $height};
  width: ${({ $width = '100%' }) => $width};
  display: ${({ $display = '' }) => $display};
  justify-content: ${({ $justifyContent = '' }) => $justifyContent};
  align-items: ${({ $alignItems = 'center' }) => $alignItems};
  padding: ${({ $padding = '0 0.6rem' }) => $padding};
  gap: ${({ $gap = 0 }) => $gap};
  background: ${({ $background = '' }) => $background};
  position: ${({ $position = '' }) => $position};
  top: ${({ $top = '' }) => $top};
  right: ${({ $right = '' }) => $right};
  left: ${({ $left = '' }) => $left};
  bottom: ${({ $bottom = '' }) => $bottom};
  flex-direction: ${({ $flexDirection = '' }) => $flexDirection};
  border: ${({ $border = '' }) => $border};
  border-bottom: ${({ $borderBottom = '' }) => $borderBottom};
`

// export const Flex = styled.div<Partial<StyleProps>>`
//   height: ${({ $height = '66px' }) => $height};
//   width: ${({ $width = '100%' }) => $width};
//   display: flex;
//   justify-content: ${({ $justifyContent = '' }) => $justifyContent};
//   align-items: ${({ $alignItems = '' }) => $alignItems};
//   padding: ${({ $padding = '0 0.6rem' }) => $padding};
//   gap: ${({ $gap = 0 }) => $gap};
//   cursor: pointer;
//   background: ${({ $background = '' }) => $background};
// `
