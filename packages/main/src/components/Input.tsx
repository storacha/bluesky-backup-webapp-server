'use client'

import React, { forwardRef } from 'react'

type AsType = 'input' | 'textarea'
type ElementType<T extends AsType = 'input'> = T extends 'textarea'
  ? HTMLTextAreaElement
  : HTMLInputElement

export interface BaseInputProps {
  variant?: 'default' | 'outline' | 'filled'
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  label?: string
  helperText?: string
  as?: AsType
  rows?: number
}

export type InputProps<T extends AsType = 'input'> = BaseInputProps &
  (T extends 'textarea'
    ? React.TextareaHTMLAttributes<HTMLTextAreaElement>
    : React.InputHTMLAttributes<HTMLInputElement>)

const Input = forwardRef(
  <T extends AsType = 'input'>(
    {
      className = '',
      variant = 'default',
      error,
      leftIcon,
      rightIcon,
      label,
      helperText,
      disabled,
      id,
      as = 'input' as T,
      rows = 3,
      ...props
    }: InputProps<T>,
    ref: React.Ref<ElementType<T>>
  ) => {
    const baseStyles =
      'w-full px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none'

    const variants = {
      default:
        'border border-gray-300 focus:border-[var(--color-bluesky-blue)] focus:ring-2 focus:ring-[var(--color-bluesky-blue)]/20',
      outline:
        'border-2 border-[var(--color-bluesky-blue)] focus:ring-2 focus:ring-[var(--color-bluesky-blue)]/20',
      filled:
        'bg-gray-100 border border-transparent focus:bg-white focus:border-[var(--color-bluesky-blue)]',
    }

    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    const classes = [
      baseStyles,
      variants[variant],
      error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : '',
      className,
    ].join(' ')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs text-gray-700 uppercase font-bold"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {leftIcon}
            </span>
          )}

          {as === 'textarea' ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              className={classes}
              disabled={disabled}
              rows={rows}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={inputId}
              className={classes}
              disabled={disabled}
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {rightIcon}
            </span>
          )}
        </div>
        {(error || helperText) && (
          <p className={`text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
