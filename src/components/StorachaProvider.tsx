'use client'

import type { ReactNode } from 'react'
import { Provider } from '@storacha/ui-react'
import {
  receiptsEndpoint,
  serviceConnection,
  servicePrincipal,
} from './services'

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
