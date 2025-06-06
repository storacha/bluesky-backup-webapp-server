import { useMediaQuery } from 'react-responsive'

export interface ResponsiveBreakpoints {
  isMobile: boolean
  isTablet: boolean
  isBaseLaptop: boolean
  isSmallViewPort: boolean
}

export function useMobileScreens(): ResponsiveBreakpoints {
  const isMobile = useMediaQuery({ query: '(max-width: 576px)' })
  const isTablet = useMediaQuery({ minWidth: 576, maxWidth: 992 })
  // laptop breakpoint/screens that do not cross the 1024px threshold
  const isBaseLaptop = useMediaQuery({ minWidth: 993, maxWidth: 1024 })

  const isSmallViewPort = isMobile || isTablet

  return {
    isMobile,
    isTablet,
    isBaseLaptop,
    isSmallViewPort,
  }
}
