'use client'

import { forwardRef } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/solid'

export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  isLoading?: boolean
  isFullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  hideLoadingText?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      isLoading = false,
      isFullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      hideLoadingText = false,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer'

    const variants = {
      primary:
        'bg-[var(--color-storacha-red)] text-white hover:bg-[#B30F10] focus:ring-[var(--color-storacha-red)]',
      secondary:
        'bg-red-100 text-[var(--color-storacha-red)] hover:bg-red-200 focus:ring-[var(--color-storacha-red)]',
      outline:
        'border-2 border-[var(--color-storacha-red)] text-[var(--color-storacha-red)] hover:bg-[var(--color-storacha-red)] hover:text-white',
      ghost:
        'text-[var(--color-storacha-red)] hover:bg-[var(--color-storacha-red)]/10',
    }

    const classes = [
      baseStyles,
      variants[variant],
      isFullWidth ? 'w-full' : '',
      className,
    ].join(' ')

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
            {!hideLoadingText && <span>Loading...</span>}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            {leftIcon && <span className="inline-flex">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex">{rightIcon}</span>}
          </div>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
