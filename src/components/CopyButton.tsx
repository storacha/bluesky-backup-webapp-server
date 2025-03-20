'use client'
import { useState } from "react"
import { ClipboardDocumentCheckIcon, ClipboardDocumentIcon } from "@heroicons/react/20/solid"
import { CopyToClipboard } from 'react-copy-to-clipboard'

export default function CopyButton ({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <CopyToClipboard text={text} onCopy={() => { setCopied(true) }}>
      {copied ? <ClipboardDocumentCheckIcon className="w-4 h-4" /> : (<ClipboardDocumentIcon className="w-4 h-4" />)}
    </CopyToClipboard>
  )
}