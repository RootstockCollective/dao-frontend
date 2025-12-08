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
 * Shows wallet balance, total deposited, and deposit/withdraw buttons
 */
export const VaultUserMetricsContainer = () => {
  const { userShares, isLoading, totalShares, formattedUserUsdrifBalance } = useVaultBalance()
  const { balances, isBalancesLoading } = useGetAddressBalances()
  const { isConnected } = useAccount()
  const userUsdrifBalance = balances[USDRIF]

  // Calculate percentage of vault owned by user (shares vs total shares would be more accurate, but using assets for approximation)
  const userSharesPercentage = totalShares > 0 ? (Number(userShares) / Number(totalShares)) * 100 : 0

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-row flex-wrap gap-6 items-center w-full">
        {isConnected && (
          <BalanceInfo
            className="max-w-[214px] min-w-[180px]"
            title="Your Wallet Balance"
            amount={isBalancesLoading ? '...' : userUsdrifBalance.formattedBalance}
            symbol="USDRIF"
          />
        )}
        <BalanceInfo
          className="max-w-[214px] min-w-[180px]"
          title="Your Vault Balance"
          amount={isLoading ? '...' : formattedUserUsdrifBalance}
          symbol="USDRIF"
        />
        {isConnected && userShares > 0 && (
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-xs font-semibold text-v3-text-secondary tracking-wide">Your Vault Share</h3>
            <CircularProgress percentage={userSharesPercentage} size="small" />
          </div>
        )}
      </div>
      <div className="flex flex-row justify-end w-full mt-2">
        <VaultActions />
      </div>
    </div>
  )
}
