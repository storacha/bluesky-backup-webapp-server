import { ArrowLeft } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'

import { Button } from './ui'

export const BackButton = () => {
  const router = useRouter()
  return (
    <Button
      $background="none"
      $color="var(--color-black)"
      $width="6%"
      $alignItems="center"
      $gap="1rem"
      $padding="0"
      onClick={() => router.back()}
    >
      <ArrowLeft size={18} />
    </Button>
  )
}
