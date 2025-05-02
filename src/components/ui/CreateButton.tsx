import { Button } from '@/components/ui'

import type React from 'react'

/**
 * A button that we'd use for creating a new item. This is currently a guess at
 * its actual scope--the name should evolve as we understan what this form of
 * button should be used for in the app.
 */
export const CreateButton = ({
  type,
  onClick,
  disabled,
  children,
}: Pick<
  React.ComponentProps<typeof Button>,
  'type' | 'onClick' | 'disabled' | 'children'
>) => (
  <Button
    $background={
      disabled ? 'var(--color-gray-medium)' : 'var(--color-dark-blue)'
    }
    $color="var(--color-white)"
    $textTransform="capitalize"
    $width="fit-content"
    $fontSize="0.75rem"
    type={type}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </Button>
)
