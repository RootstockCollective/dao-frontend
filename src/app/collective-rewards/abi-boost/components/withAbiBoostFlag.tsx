import { ComponentType } from 'react'

import { useIsAbiBoostEnabled } from '../hooks/useAbiBoost'

export const withAbiBoostFlag = <P extends object>(Component: ComponentType<P>) => {
  const Gated = (props: P) => (useIsAbiBoostEnabled() ? <Component {...props} /> : null)
  Gated.displayName = `withAbiBoostFlag(${Component.displayName ?? Component.name})`
  return Gated
}
