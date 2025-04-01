'use client'

import React from 'react'
import { SWRConfig } from 'swr'

export default function SWRConfigProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SWRConfig
      value={{
        async fetcher(resource) {
          return fetch(resource).then((res) => res.json())
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}
