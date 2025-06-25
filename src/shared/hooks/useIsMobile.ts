import { useMediaQuery } from 'react-responsive'
import { MOBILE_DESKTOP_BREAKPOINT } from '@/lib/constants'

/**
 * Hook to check if the screen is mobile.
 */
export function useIsMobile() {
  return useMediaQuery({ maxWidth: MOBILE_DESKTOP_BREAKPOINT - 1 })
}
