'use client'

import { BalanceInfo } from '@/components/BalanceInfo'
import { useVaultBalance } from '../hooks/useVaultBalance'
import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { useAccount } from 'wagmi'
import { USDRIF } from '@/lib/constants'
import { VaultActions } from './VaultActions'

/**
 * Component displaying user-specific vault metrics and actions
 * Shows wallet balance, total deposited, and deposit/withdraw buttons
 */
export const VaultUserMetricsContainer = () => {
  const { userShares, isLoading, formattedUserUsdrifBalance, formattedUserShares } = useVaultBalance()
  const { balances, isBalancesLoading } = useGetAddressBalances()
  const { isConnected } = useAccount()
  const userUsdrifBalance = balances[USDRIF]

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
          <BalanceInfo
            className="max-w-[214px] min-w-[180px]"
            title="Your Share Balance"
            amount={isLoading ? '...' : formattedUserShares}
            symbol="Shares"
          />
        )}
      </div>
      <div className="flex flex-row justify-end w-full mt-2">
        <VaultActions />
      </div>
    </div>
  )
}
