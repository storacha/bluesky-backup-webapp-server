import { Stack } from '@/components/ui'
import { styled } from 'next-yak'

const Outside = styled(Stack)`
  background-color: var(--color-gray-medium-light);
  min-height: 100vh;
  align-items: stretch;
`

export default function BackupLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Outside $direction="row" $gap="1rem">
      {children}
    </Outside>
  )
}
