import { Property } from 'csstype'
import { styled } from 'next-yak'

import { StyleProps } from './style'

interface TextProps {
  $color?: Property.Color
  $fontSize?: Property.FontSize
  $fontWeight?: Property.FontWeight
  $lineHeight?: Property.LineHeight
  $textAlign?: Property.TextAlign
  $letterSpacing?: Property.LetterSpacing
  $wordSpacing?: Property.WordSpacing
  $textTransform?: Property.TextTransform
  // we can add more properties here when the need arises
  // perhaps in the future
}

export const Text = styled.p<TextProps & Partial<StyleProps>>`
  color: ${({ $color = 'var(--color-gray-medium)' }) => $color};
  font-size: ${({ $fontSize = '0.75rem' }) => $fontSize};
  text-align: ${({ $textAlign = '' }) => $textAlign};
  font-weight: ${({ $fontWeight = '400' }) => $fontWeight};
  line-height: ${({ $lineHeight = '' }) => $lineHeight};
  word-spacing: ${({ $wordSpacing = '' }) => $wordSpacing};
  letter-spacing: ${({ $letterSpacing = '' }) => $letterSpacing};
  text-transform: ${({ $textTransform = 'none' }) => $textTransform};
  width: ${({ $width = '' }) => $width};
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
