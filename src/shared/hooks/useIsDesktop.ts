import { useMediaQuery } from 'react-responsive'
import { MOBILE_DESKTOP_BREAKPOINT } from '@/lib/constants'

/**
 * Hook to check if the screen is desktop.
 */
export function useIsDesktop() {
  return useMediaQuery({ minWidth: MOBILE_DESKTOP_BREAKPOINT })
}
