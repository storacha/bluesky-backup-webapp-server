import { Stack } from '@/components/ui'
import { styled } from 'next-yak'

const Outside = styled(Stack)`
  background-color: var(--color-gray-medium-light);
  min-height: 100vh;
  align-items: stretch;
  padding: 2rem;
`

export default function ConfigLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <Outside>{children}</Outside>
}
