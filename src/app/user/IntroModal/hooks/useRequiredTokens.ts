import { useMemo } from 'react'

import { useStakingRequirements } from './useStakingRequirements'

export const NEED_RBTC_RIF = 'NEED_RBTC_RIF'
export const NEED_RBTC = 'NEED_RBTC'
export const NEED_RIF = 'NEED_RIF'
export const NEED_STRIF = 'NEED_STRIF'

export type IntroModalStatus = typeof NEED_RBTC_RIF | typeof NEED_RBTC | typeof NEED_RIF | typeof NEED_STRIF

/**
 * Collapses the user's missing balances into a single status.
 *
 * Kept for the staking notification banners, which key their copy off these four values. The
 * onboarding modal itself reads {@link useStakingRequirements} directly, because it needs the
 * individual flags to build its step list.
 *
 * Returns null when the user is not connected, balances are still loading, or nothing is
 * missing.
 */
export const useRequiredTokens = (): IntroModalStatus | null => {
  const { needsRif, needsGas, needsStRif, isReady } = useStakingRequirements()

  return useMemo(() => {
    if (!isReady) {
      return null
    }
    if (needsRif && needsGas) {
      return NEED_RBTC_RIF
    }
    if (needsGas) {
      return NEED_RBTC
    }
    if (needsRif) {
      return NEED_RIF
    }
    if (needsStRif) {
      return NEED_STRIF
    }
    return null
  }, [isReady, needsRif, needsGas, needsStRif])
}
