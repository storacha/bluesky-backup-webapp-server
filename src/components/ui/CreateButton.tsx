import { StatefulButton } from '@/components/ui'

import type { StyleProps } from '@/components/ui/style'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * A button that we'd use for creating a new item. This is currently a guess at
 * its actual scope--the name should evolve as we understand what this form of
 * button should be used for in the app.
 */
export const CreateButton = ({
  type,
  onClick,
  disabled = false,
  children,
  $isLoading = false,
  $mt = '0',
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> & {
  disabled?: boolean
  children: ReactNode
  $isLoading?: boolean
  $mt?: string
} & Partial<StyleProps>) => (
  <StatefulButton
    $background={
      disabled ? 'var(--color-gray-medium)' : 'var(--color-dark-blue)'
    }
    $color="var(--color-white)"
    $textTransform="capitalize"
    $width="fit-content"
    $fontSize="0.75rem"
    $mt={$mt}
    type={type}
    onClick={onClick}
    isLoading={$isLoading}
    disabled={disabled}
    {...rest}
  >
    {children}
  </StatefulButton>
)
