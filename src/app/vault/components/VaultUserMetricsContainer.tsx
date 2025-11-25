'use client'

import { BalanceInfo } from '@/components/BalanceInfo'
import { useVaultBalance } from '../hooks/useVaultBalance'
import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { useAccount } from 'wagmi'
import { formatSymbol } from '@/app/shared/formatter'
import { USDRIF } from '@/lib/constants'
import { VaultActions } from './VaultActions'
import { CircularProgress } from './CircularProgress'

/**
 * Component displaying user-specific vault metrics and actions
 * Shows wallet balance, total supplied, and supply/withdraw buttons
 */
export const VaultUserMetricsContainer = () => {
  const { totalAssets, userBalance, isLoading } = useVaultBalance()
  const { balances, isBalancesLoading } = useGetAddressBalances()
  const { isConnected } = useAccount()
  const userUsdrifBalance = balances[USDRIF]

  // Calculate percentage of vault owned by user
  const vaultPercentage = totalAssets > 0 ? (Number(userBalance) / Number(totalAssets)) * 100 : 0

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-row flex-wrap gap-6 items-center w-full">
        {isConnected && (
          <BalanceInfo
            className="max-w-[214px] min-w-[180px]"
            title="Your wallet balance"
            amount={isBalancesLoading ? '...' : userUsdrifBalance.formattedBalance}
            symbol="USDRIF"
          />
        )}
        <BalanceInfo
          className="max-w-[214px] min-w-[180px]"
          title="Your total deposited"
          amount={isLoading ? '...' : formatSymbol(userBalance, 'USDRIF')}
          symbol="USDRIF"
        />
        {isConnected && userBalance > 0 && (
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-xs font-semibold text-v3-text-secondary uppercase tracking-wide">
              Your Vault Share
            </h3>
            <CircularProgress percentage={vaultPercentage} size="small" />
          </div>
        )}
      </div>
      <div className="flex flex-row justify-end w-full mt-2">
        <VaultActions />
      </div>
    </div>
  )
}
