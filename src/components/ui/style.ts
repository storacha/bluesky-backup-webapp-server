// all the known CSS properties so we don't have to always duplicate
// them when we make components accepting custom props with yak
import { Property } from 'csstype'

export type StyleProps = {
  $color?: Property.Color
  $fontSize?: Property.FontSize
  $fontWeight?: Property.FontWeight
  $lineHeight?: Property.LineHeight
  $textAlign?: Property.TextAlign
  $letterSpacing?: Property.LetterSpacing
  $wordSpacing?: Property.WordSpacing
  $textTransform?: Property.TextTransform
  $padding: Property.Padding
  $borderStyle: Property.BorderStyle
  $height: Property.Height
  $background: Property.Background
  $width: Property.Width
  $border: Property.Border
  $position: Property.Position
  $direction: Property.FlexDirection
  $gap: Property.Gap
  $justifyContent: Property.JustifyContent
  $alignItems: Property.AlignItems
  $wrap: Property.FlexWrap
  $maxWidth: Property.MaxWidth
  $display: Property.Display
  $borderWidth: Property.BorderWidth
  $borderColor: Property.BorderColor
}
