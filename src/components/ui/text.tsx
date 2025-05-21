import { styled } from 'next-yak'

import { StyleProps } from './style'

export type TextProps = Partial<
  Pick<
    StyleProps,
    | '$color'
    | '$fontSize'
    | '$fontWeight'
    | '$lineHeight'
    | '$textAlign'
    | '$letterSpacing'
    | '$wordSpacing'
    | '$textTransform'
    | '$width'
    | '$maxWidth'
    | '$border'
    | '$whiteSpace'
  >
>

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
  max-width: ${({ $maxWidth = '' }) => $maxWidth};
  border: ${({ $border = '' }) => $border};
  white-space: ${({ $whiteSpace = '' }) => $whiteSpace};
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
