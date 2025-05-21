import { useMediaQuery } from 'react-responsive'

const mobileDesktopBreakpoint = 640

export function useIsDesktop() {
  const isDesktop = useMediaQuery({ minWidth: mobileDesktopBreakpoint })
  return isDesktop
}
