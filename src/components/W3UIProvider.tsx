import { Provider } from '@w3ui/react'

export default function W3UIProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      {children}
    </Provider>
  )
}