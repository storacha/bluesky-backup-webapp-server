'use client'
import { CheckFat, Copy } from '@phosphor-icons/react'
import { styled } from 'next-yak'
import { useEffect, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { Button } from './ui'

interface CopyButtonProps {
  text: string
  className?: string
}

const IconButton = styled(Button)`
  display: inline;
  background: transparent;
`

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 1500)
      return () => clearTimeout(timeout)
    }
  }, [copied])
  const iconColor = copied ? 'var(--color-green)' : 'var(--color-gray-medium)'
  return (
    <CopyToClipboard
      text={text}
      onCopy={() => {
        setCopied(true)
      }}
    >
      <IconButton aria-label={copied ? 'Copied!' : 'Copy to clipboard'}>
        {copied ? (
          <CheckFat size="16" color={iconColor} />
        ) : (
          <Copy size="16" color={iconColor} />
        )}
      </IconButton>
    </CopyToClipboard>
  )
}
