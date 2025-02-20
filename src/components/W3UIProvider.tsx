import { Provider as W3UIProvider } from '@w3ui/react'

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <W3UIProvider>
      {children}
    </W3UIProvider>
  )
}