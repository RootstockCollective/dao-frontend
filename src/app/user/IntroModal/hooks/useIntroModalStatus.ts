import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { useAccount } from 'wagmi'
import { useMemo } from 'react'
import Big from '@/lib/big'
import { RIF, RBTC } from '@/lib/constants'
import type { IntroModalStatus } from '../config'

export const useIntroModalStatus = (): IntroModalStatus | null => {
  const { isConnected } = useAccount()
  const { balances, isBalancesLoading } = useBalancesContext()

  return useMemo(() => {
    // Don't show modal if user is not connected or balances are still loading
    if (!isConnected || isBalancesLoading) {
      return null
    }

    const hasRif = Big(balances[RIF].balance).gt(0)
    const hasRbtc = Big(balances[RBTC].balance).gt(0)

    // Determine which modal to show based on what tokens the user has
    if (!hasRif && !hasRbtc) {
      // User has neither RIF nor RBTC - show modal to get both
      return 1
    }
    if (hasRif && !hasRbtc) {
      // User has RIF but no RBTC - show modal to get RBTC
      return 2
    }
    if (!hasRif && hasRbtc) {
      // User has RBTC but no RIF - show modal to get RIF
      return 3
    }
    // User has both RIF and RBTC - don't show modal
    return null
  }, [isConnected, isBalancesLoading, balances])
}
