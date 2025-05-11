import { useMediaQuery } from 'react-responsive'

export const useMobileScreens = () => {
  const isMobile = useMediaQuery({ query: '(max-width: 576px)' })
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 992 })
  // laptop breakpoint/screens that do not cross the 1024px threshold
  const isBaseLaptop = useMediaQuery({minWidth: 993, maxWidth: 1024})

  const isSmallViewPort = isMobile || isTablet

  return {
    isMobile,
    isTablet,
    isBaseLaptop,
    isSmallViewPort,
  }
}
