import { Property } from 'csstype'
import { styled } from 'next-yak'

export interface BtnProps {
  $color: Property.Color
  $fontFamily: Property.FontFamily
  $fontWeight: Property.FontWeight
  $height: Property.Height
  $borderRadius: Property.BorderRadius
  $fontSize: Property.FontSize
  $textAlign: Property.TextAlign
  $background: Property.Background | Property.BackgroundColor
  $textTransform: Property.TextTransform
  $width: Property.Width
  $mt: Property.MarginTop
  $mx: `${Property.MarginLeft} ${Property.MarginRight}`
  $px: `${Property.PaddingLeft} ${Property.PaddingRight}`
  $py: `${Property.PaddingTop} ${Property.PaddingBottom}`
  $my: `${Property.MarginTop} ${Property.MarginBottom}`
  $pt: `${Property.PaddingTop}`
}

export const Button = styled.button<Partial<BtnProps>>`
  font-family: ${({ $fontFamily = 'var(--font-dm-mono)' }) => $fontFamily};
  font-weight: ${({ $fontWeight = '300' }) => $fontWeight};
  padding: ${({ $py = '0.75rem', $px = '1rem' }) => `${$py} ${$px}`};
  border-radius: ${({ $borderRadius = '0.75rem' }) => $borderRadius};
  background-color: ${({ $background = 'var(--color-black)' }) => $background};
  color: ${({ $color = 'var(--color-white)' }) => $color};
  font-size: ${({ $fontSize = '1.125rem' }) => $fontSize};
  text-align: ${({ $textAlign = 'center' }) => $textAlign};
  text-transform: ${({ $textTransform = '' }) => $textTransform};
  width: ${({ $width = '' }) => $width};
  margin: ${({ $my = '', $mx = '' }) => `${$my} ${$mx}`};
  margin-top: ${({ $mt = '' }) => $mt};
  height: ${({ $height = '' }) => $height};

  &:active {
    background-color: var(--color-gray-medium);
  }
`
