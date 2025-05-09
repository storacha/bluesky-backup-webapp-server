import { useMediaQuery } from 'react-responsive'

export const useMobileScreens = () => {
  const isMobile = useMediaQuery({ query: '(max-width: 576px)' })
  const isTablet = useMediaQuery({ query: '(max-width: 992px)' })

  const isSmallViewPort = isMobile || isTablet

  return {
    isMobile,
    isTablet,
    isSmallViewPort,
  }
}
