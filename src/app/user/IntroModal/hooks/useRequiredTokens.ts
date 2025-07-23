import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import Big from '@/lib/big'
import { RBTC, RIF, stRIF } from '@/lib/constants'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { IntroModalStatus } from '../config'

// export each of the IntroModalStatus as a constant
export const NEED_RBTC_RIF = 'NEED_RBTC_RIF'
export const NEED_RBTC = 'NEED_RBTC'
export const NEED_RIF = 'NEED_RIF'
export const NEED_STRIF = 'NEED_STRIF'

/**
 * Returns the status of the intro modal based on the user's balances.
 * Determines which tokens (RIF, RBTC, or stRIF) a user needs to add to their wallet.
 * Returns null if the user has all required tokens or is not connected.
 * Returns 'NEED_RBTC_RIF' if user needs both RBTC and RIF or stRIF.
 * Returns 'NEED_RBTC' if user only needs RBTC.
 * Returns 'NEED_RIF' if user only needs RIF or stRIF.
 * Returns 'NEED_STRIF' if user has RIF but needs stRIF.
 */
export const useRequiredTokens = (): IntroModalStatus | null => {
  const { isConnected } = useAccount()
  const { balances, isBalancesLoading } = useBalancesContext()

  return useMemo(() => {
    // Don't show modal if user is not connected or balances are still loading
    if (!isConnected || isBalancesLoading) {
      return null
    }

    const hasRbtc = Big(balances[RBTC].balance).gt(0)
    const hasRif = Big(balances[RIF].balance).gt(0)
    const hasStRif = Big(balances[stRIF].balance).gt(0)

    const needRbtc = !hasRbtc
    const needRif = !hasRif && !hasStRif
    const needStRif = !hasStRif

    // Determine which modal to show based on what tokens the user has
    if (needRif && needRbtc) {
      // User has neither RIF/stRIF nor RBTC
      return NEED_RBTC_RIF
    }
    if (needRbtc) {
      // User has RIF/stRIF but no RBTC
      return NEED_RBTC
    }
    if (needRif) {
      // User has RBTC but no RIF/stRIF
      return NEED_RIF
    }
    if (needStRif) {
      // User has RIF but no stRIF
      return NEED_STRIF
    }
    // User has both RIF/stRIF and RBTC, don't show modal
    return null
  }, [isConnected, isBalancesLoading, balances])
}
