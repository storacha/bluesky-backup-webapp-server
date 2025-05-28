'use client'
import { CheckFat, Copy } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

import { IconButton } from './ui'

interface CopyButtonProps {
  text: string
  className?: string
}

export default function CopyButton({ text }: CopyButtonProps) {
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
        <CheckFat size="16" color={iconColor} />
      ) : (
        <Copy size="16" color={iconColor} />
      )}
    </IconButton>
  )
}
