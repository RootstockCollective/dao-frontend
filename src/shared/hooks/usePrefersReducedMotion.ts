import { useMediaQuery } from 'react-responsive'

/**
 * Hook to check whether the viewer asked their system for reduced motion.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery({ query: '(prefers-reduced-motion: reduce)' })
}
