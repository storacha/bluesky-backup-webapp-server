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

export const Heading = styled.h2`
  font-weight: 700;
  color: #000;
  font-size: 1.125rem;
  text-transform: capitalize;
`

export const SubHeading = styled.h3`
  font-weight: 600;
  color: var(--color-gray-medium);
  font-size: 0.75rem;
  text-transform: capitalize;
`
