// all the known CSS properties so we don't have to always duplicate
// them when we make components accepting custom props with yak
import { Property } from 'csstype'
import { styled } from 'next-yak'
import { ReactNode } from 'react'

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
  $borderBottom: Property.BorderBottom
  $flexDirection: Property.FlexDirection
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
  $top: Property.Top
  $left: Property.Left
  $right: Property.Right
  $bottom: Property.Bottom
  $borderRadius: Property.BorderRadius
  $fontFamily: Property.FontFamily
  $mt: Property.MarginTop
  $mx: Property.MarginLeft
  $px: Property.PaddingLeft
  $py: Property.PaddingTop
  $my: Property.MarginTop
  $pt: Property.PaddingTop
  $overflow: Property.Overflow
  $overflowX: Property.OverflowX
  $overflowY: Property.OverflowY
  $textDecor: Property.TextDecoration
}

export type BtnVariant = 'primary' | 'secondary' | 'outline'

export interface BtnProps extends StyleProps {
  $isLoading?: boolean
  $hideLoadingText?: boolean
  $variant?: BtnVariant
  $leftIcon?: ReactNode
  $disabled?: boolean
}

export const NoTextTransform = styled.span`
  text-transform: none;
`
