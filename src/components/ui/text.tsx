import { Property } from 'csstype'
import { styled } from 'next-yak'
import { StyleProps } from './style'

export interface TextProps extends Partial<StyleProps> {
  $color?: Property.Color
  $fontSize?: Property.FontSize
  $fontWeight?: Property.FontWeight
  $lineHeight?: Property.LineHeight
  $textAlign?: Property.TextAlign
  $letterSpacing?: Property.LetterSpacing
  $wordSpacing?: Property.WordSpacing
  $textTransform?: Property.TextTransform
}

export const Text = styled.p<TextProps>`
  color: ${({ $color = 'var(--color-gray-medium)' }) => $color};
  font-size: ${({ $fontSize = '0.75rem' }) => $fontSize};
  text-align: ${({ $textAlign = '' }) => $textAlign};
  font-weight: ${({ $fontWeight = '400' }) => $fontWeight};
  line-height: ${({ $lineHeight = '' }) => $lineHeight};
  word-spacing: ${({ $wordSpacing = '' }) => $wordSpacing};
  letter-spacing: ${({ $letterSpacing = '' }) => $letterSpacing};
  text-transform: ${({ $textTransform = 'none' }) => $textTransform};
  width: ${({ $width = '' }) => $width};
  border: ${({ $border = '' }) => $border};
`
// we may need this. maybe not now, but later
// just to bypass knip's warning, i'll leaved it commented out.
// const Flex = styled.div<Partial<StyleProps>>`
//   height: ${({ $height = '66px' }) => $height};
//   width: ${({ $width = '100%' }) => $width};
//   display: flex;
//   justify-content: space-between;
//   align-items: ${({ $alignItems = '' }) => $alignItems};
//   padding: ${({ $padding = '0 0.6rem' }) => $padding};
//   gap: ${({ $gap = 0 }) => $gap};
//   cursor: pointer;
//   background: ${({ $background = '' }) => $background};
// `
