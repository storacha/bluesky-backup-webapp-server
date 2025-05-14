import { keyframes, styled } from 'next-yak'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- For JSDoc
import type { FullscreenLoader, Loader } from '../Loader'

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

const sizeToPixels = {
  xs: '0.75rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
}

const borderWidths = {
  xs: '2px',
  sm: '2px',
  md: '3px',
  lg: '4px',
}

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const SpinnerBase = styled.div`
  display: inline-block;
  border-radius: 50%;
  border-style: solid;
  border-left-color: transparent;
  border-bottom-color: transparent;
  border-right-color: transparent;
  animation: ${spin} 0.75s linear infinite;
`

interface SpinnerProps {
  size?: SpinnerSize
  color?: string
  className?: string
}

/**
 * A small spinner, used as an indeterminate progress indicator on buttons which
 * have been pressed, and potentially other small places. For loading pages and
 * sections of pages, use {@link Loader} or {@link FullscreenLoader}.
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'sm',
  color = 'var(--color-gray-medium)',
  className,
}) => {
  const spinnerStyle = {
    height: sizeToPixels[size],
    width: sizeToPixels[size],
    borderWidth: borderWidths[size],
    borderTopColor: color,
  }

  return <SpinnerBase className={className} style={spinnerStyle} />
}
