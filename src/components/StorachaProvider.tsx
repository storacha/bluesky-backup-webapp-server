'use client'

import { Provider } from '@storacha/ui-react'

import {
  receiptsEndpoint,
  serviceConnection,
  servicePrincipal,
} from './services'

import type { ReactNode } from 'react'

export default function StorachaProvider({
  children,
}: {
  children: ReactNode
}) {
  return (
    <Provider
      connection={serviceConnection}
      servicePrincipal={servicePrincipal}
      receiptsEndpoint={receiptsEndpoint}
    >
      <>{children}</>
    </Provider>
  )
}
