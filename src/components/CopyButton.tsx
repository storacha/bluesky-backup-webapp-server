'use client'
import { CheckFatIcon, CopyIcon, IconProps } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

import { IconButton } from './ui'

interface CopyButtonProps extends Pick<IconProps, 'size'> {
  text: string
  className?: string
}

export default function CopyButton({ text, size = '16' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 1500)
      return () => clearTimeout(timeout)
    }
  }, [copied])
  const iconColor = copied ? 'var(--color-green)' : 'var(--color-gray-medium)'
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
  }
  return (
    <IconButton
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      aria-label="Copy to clipboard"
      onClick={copy}
    >
      {copied ? (
        <CheckFatIcon display="block" size={size} color={iconColor} />
      ) : (
        <CopyIcon display="block" size={size} color={iconColor} />
      )}
    </IconButton>
  )
}
