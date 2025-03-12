import type { ReactNode } from 'react'
import { Provider } from '@w3ui/react'
import { receiptsURL, serviceConnection, servicePrincipal } from './services'

export default function StorachaProvider ({ children }: { children: ReactNode }) {
  return (
    <Provider
      connection={serviceConnection}
      servicePrincipal={servicePrincipal}
      receiptsEndpoint={receiptsURL}
    >
      <>{children}</>
    </Provider>
  )
}