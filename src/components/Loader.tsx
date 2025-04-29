import React, { ReactNode } from 'react'
import { ArrowPathIcon } from '@heroicons/react/20/solid'

export function Loader({ className }: { className?: string }): ReactNode {
  return (
    <ArrowPathIcon
      className={`animate-spin ${className || 'h-12 w-12 mx-auto mt-12'}`}
    />
  )
}
