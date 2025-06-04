import { Property } from 'csstype'
import { styled } from 'next-yak'
import { ButtonHTMLAttributes, ReactNode } from 'react'

import { Spinner } from './spinner'
import { BtnProps, BtnVariant, StyleProps } from './style'

const buttonBackgroundColor = (
  $background: Property.Background = 'var(--color-black)',
  $disabled: boolean,
  $variant: BtnVariant
) => {
  if ($variant === 'outline') {
    return 'transparent'
  } else {
    return $disabled ? 'var(--color-gray-light)' : $background
  }
}

const ButtonElement = styled.button<
  Partial<BtnProps & { $noPadding: boolean }>
>`
  font-family: ${({ $fontFamily = 'var(--font-dm-mono)' }) => $fontFamily};
  font-weight: ${({ $fontWeight = '300' }) => $fontWeight};
  padding: ${({ $py, $px, $noPadding }) =>
    `${$py || ($noPadding ? '0' : '0.75rem')} ${$px || ($noPadding ? '0' : '1rem')}`};
  border-radius: ${({ $borderRadius = '0.75rem' }) => $borderRadius};
  background-color: ${({
    $background = 'var(--color-dark-blue)',
    $disabled = false,
    $variant = 'primary',
  }) => buttonBackgroundColor($background, $disabled, $variant)};
  color: ${({ $color = 'var(--color-white)', $disabled }) =>
    $disabled ? 'var(--color-gray-medium)' : $color};
  font-size: ${({ $fontSize = '1.125rem' }) => $fontSize};
  text-align: ${({ $textAlign = 'center' }) => $textAlign};
  text-transform: ${({ $textTransform = '' }) => $textTransform};
  width: ${({ $width = '' }) => $width};
  margin: ${({ $my = '', $mx = '' }) => `${$my} ${$mx}`};
  margin-top: ${({ $mt = '' }) => $mt};
  height: ${({ $height = '' }) => $height};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  position: relative;
  transition: background-color 0.2s ease;
  border: none;
  outline: none;
  align-items: center;
  &:disabled {
    background-color: var(--color-gray-light);
    color: var(--color-gray-medium);
    cursor: not-allowed;
  }
  &:active:not(:disabled) {
    background-color: var(--color-gray-medium);
  }
`

export const Button = ({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  Partial<BtnProps & { $noPadding: boolean }>) => (
  <ButtonElement {...props}>
    {props.$leftIcon && <>{props.$leftIcon} </>}
    {children}
  </ButtonElement>
)

const SpinnerWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
`

interface StatefulBtnProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    Partial<StyleProps> {
  isLoading: boolean
  disabled: boolean
  children: ReactNode
}

export const StatefulButton = ({
  isLoading = false,
  disabled = false,
  children,
  ...props
}: StatefulBtnProps) => {
  return (
    <Button
      $isLoading={isLoading}
      $disabled={disabled || isLoading}
      disabled={disabled || isLoading}
      {...props}
    >
      <span style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
        {children}
      </span>
      {isLoading && (
        <SpinnerWrapper>
          <Spinner />
        </SpinnerWrapper>
      )}
    </Button>
  )
}

export const IconButton = styled(Button)`
  display: inline;
  background: transparent;
  padding: 0;
`
