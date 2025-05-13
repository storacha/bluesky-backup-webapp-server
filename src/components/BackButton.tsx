import { ArrowLeft } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'

import { useMobileScreens } from '@/hooks/use-mobile-screens'

import { Button } from './ui'

export const BackButton = () => {
  const router = useRouter()
  const { isSmallViewPort } = useMobileScreens()
  return (
    isSmallViewPort && (
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
  )
}
