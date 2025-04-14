'use client'
import { useState, useEffect } from 'react'
import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/20/solid'
import { CopyToClipboard } from 'react-copy-to-clipboard'

interface CopyButtonProps {
  text: string
  className?: string
}

export default function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 1500)
      return () => clearTimeout(timeout)
    }
  }, [copied])

  return (
    <CopyToClipboard
      text={text}
      onCopy={() => {
        setCopied(true)
      }}
    >
      <button
        className={`
          p-1.5 rounded-md transition-all duration-200 outline-none
          ${
            copied
              ? 'bg-red-50 text-[var(--color-storacha-red)] hover:bg-red-100'
              : 'hover:bg-red-50 hover:text-[var(--color-storacha-red)] text-gray-500'
          }
          ${className}
        `}
        aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
        type="button"
      >
        {copied ? (
          <ClipboardDocumentCheckIcon className="w-4 h-4" />
        ) : (
          <ClipboardDocumentIcon className="w-4 h-4" />
        )}
      </button>
    </CopyToClipboard>
  )
}
