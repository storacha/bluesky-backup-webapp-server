import { ArrowLeft } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useMobileScreens } from '@/hooks/use-mobile-screens'

import { Button } from './ui'

export const BackButton = ({ path }: { path?: string }) => {
  const router = useRouter()
  const { isSmallViewPort } = useMobileScreens()

  const goBack = () => {
    if (path) {
      router.push(path)
    } else {
      router.back()
    }
  }

  // we should prefetch the route if the path prop is specified
  useEffect(() => {
    if (path) router.prefetch(path)
    // it is pointless to pass the router as a dependency in this call.
    // we do not want to call `prefetch` on every render
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [path])
  return (
    (isSmallViewPort || path) && (
      <Button
        $background="none"
        $color="var(--color-black)"
        $width="fit-content"
        $alignItems="center"
        $gap="1rem"
        onClick={goBack}
        noPadding
      >
        <ArrowLeft size={18} />
      </Button>
    )
  )
}
