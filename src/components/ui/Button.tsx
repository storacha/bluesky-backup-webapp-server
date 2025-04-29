import { styled } from 'next-yak'
import { BtnProps, StyleProps } from './style'
import { Spinner } from './spinner'
import { ButtonHTMLAttributes, ReactNode } from 'react'

export const Button = styled.button<Partial<BtnProps>>`
  font-family: ${({ $fontFamily = 'var(--font-dm-mono)' }) => $fontFamily};
  font-weight: ${({ $fontWeight = '300' }) => $fontWeight};
  padding: ${({ $py = '0.75rem', $px = '1rem' }) => `${$py} ${$px}`};
  border-radius: ${({ $borderRadius = '0.75rem' }) => $borderRadius};
  background-color: ${({ $background = 'var(--color-black)', $disabled }) =>
    $disabled ? 'var(--color-gray-light)' : $background};
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

  &:disabled {
    background-color: var(--color-gray-light);
    color: var(--color-gray-medium);
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    background-color: var(--color-gray-medium);
  }
`

export const ButtonLink = styled.a<Partial<BtnProps>>`
  border: ${({ $border = 'solid' }) => $border};
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
  cursor: pointer;

  &:active {
    background-color: var(--color-gray-medium);
  }
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
      {isLoading && <Spinner />}
    </Button>
  )
}
