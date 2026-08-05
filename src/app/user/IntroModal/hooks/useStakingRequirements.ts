import { useMemo } from 'react'
import { useAccount } from 'wagmi'

import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import Big from '@/lib/big'
import { RBTC, RIF, STRIF } from '@/lib/constants'

import { useMinGasForStaking } from './useMinGasForStaking'

interface StakingRequirements {
  /** The user holds neither RIF nor stRIF, so there is nothing to stake. */
  needsRif: boolean
  /** The user's rBTC is below what approving and staking will cost. */
  needsGas: boolean
  /** The user holds no stRIF, so they have never staked. */
  needsStRif: boolean
  /** The threshold `needsGas` was decided with, so callers can show the same figure. */
  minGas: string
  /**
   * False while the wallet, the balances, or the gas threshold are still resolving. Callers
   * that freeze state on mount must wait for this.
   */
  isReady: boolean
}

/**
 * What the connected user is still missing before they can stake.
 *
 * Single source of truth for the gas threshold: both the onboarding copy and the gate that
 * decides whether to ask for gas read `minGas` from here, so the modal can never show a
 * number that differs from the one it enforces.
 */
export const useStakingRequirements = (): StakingRequirements => {
  const { isConnected } = useAccount()
  const { balances, isBalancesLoading } = useBalancesContext()
  const { minGas, isLoading: isMinGasLoading } = useMinGasForStaking()

  return useMemo(() => {
    const hasRif = Big(balances[RIF].balance).gt(0)
    const hasStRif = Big(balances[STRIF].balance).gt(0)

    return {
      needsRif: !hasRif && !hasStRif,
      // Compared against the real threshold rather than zero: someone holding dust rBTC does
      // not have enough to approve and stake, and telling them they do strands them mid-flow.
      needsGas: Big(balances[RBTC].balance).lt(minGas),
      needsStRif: !hasStRif,
      minGas,
      isReady: isConnected && !isBalancesLoading && !isMinGasLoading,
    }
  }, [isConnected, isBalancesLoading, isMinGasLoading, balances, minGas])
}
