import { useMediaQuery } from 'react-responsive'
import { MOBILE_DESKTOP_BREAKPOINT } from '@/lib/constants'

export function useIsDesktop() {
  const isDesktop = useMediaQuery({ minWidth: MOBILE_DESKTOP_BREAKPOINT })
  return isDesktop
}
