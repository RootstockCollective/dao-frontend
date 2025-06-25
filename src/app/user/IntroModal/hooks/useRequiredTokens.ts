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

    const hasStRif = Big(balances[stRIF].balance).gt(0)
    const hasRif = Big(balances[RIF].balance).gt(0)
    const hasRbtc = Big(balances[RBTC].balance).gt(0)

    const needRif = !hasStRif && !hasRif
    const needRbtc = !hasRbtc

    // Determine which modal to show based on what tokens the user has
    if (needRif && needRbtc) {
      // User has neither RIF nor RBTC
      return 'NEED_BOTH'
    }
    if (needRif) {
      // User has RIF but no RBTC
      return 'NEED_RBTC'
    }
    if (needRbtc) {
      // User has RBTC but no RIF
      return 'NEED_RIF'
    }

    // User has both RIF and RBTC, don't show modal
    return null
  }, [isConnected, isBalancesLoading, balances])
}
