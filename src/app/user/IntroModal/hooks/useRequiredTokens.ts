import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import Big from '@/lib/big'
import { RBTC, RIF, stRIF } from '@/lib/constants'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { IntroModalStatus } from '../config'

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
      return 'NEED_RBTC_RIF'
    }
    if (needRbtc) {
      // User has RIF/stRIF but no RBTC
      return 'NEED_RBTC'
    }
    if (needRif) {
      // User has RBTC but no RIF/stRIF
      return 'NEED_RIF'
    }
    if (needStRif) {
      // User has RIF but no stRIF
      return 'NEED_STRIF'
    }
    // User has both RIF/stRIF and RBTC, don't show modal
    return null
  }, [isConnected, isBalancesLoading, balances])
}
