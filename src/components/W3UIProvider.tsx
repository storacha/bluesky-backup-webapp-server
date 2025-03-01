import type { ReactNode } from 'react'
import { Provider } from '@w3ui/react'
import { serviceConnection, servicePrincipal } from './services'

export default function W3UIProvider ({ children }: { children: ReactNode }) {
  return (
    <Provider
      connection={serviceConnection}
      servicePrincipal={servicePrincipal}
    >
      <>{children}</>
    </Provider>
  )
}