import { ComponentType } from 'react'

import { useIsAbiBoostEnabled } from '../hooks/useAbiBoost'

/**
 * Renders `Component` only while the `abi_boost` flag is on. Every boost surface goes through
 * here, so retiring the flag is a single removal instead of one check per screen.
 */
export const withAbiBoostFlag = <P extends object>(Component: ComponentType<P>) => {
  const Gated = (props: P) => (useIsAbiBoostEnabled() ? <Component {...props} /> : null)
  Gated.displayName = `withAbiBoostFlag(${Component.displayName ?? Component.name})`
  return Gated
}
