'use client'

import { BalanceInfo } from '@/components/BalanceInfo'
import { useVaultBalance } from '../hooks/useVaultBalance'
import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { useAccount } from 'wagmi'
import { USDRIF, USDT0 } from '@/lib/constants'
import { VaultActions } from './VaultActions'

/**
 * Component displaying user-specific vault metrics and actions
 * Shows wallet balance, total deposited, and deposit/withdraw buttons
 */
export const VaultUserMetricsContainer = () => {
  const { isLoading, formattedUserUsdrifBalance, formattedUserShares } = useVaultBalance()
  const { balances, isBalancesLoading } = useGetAddressBalances()

  const { isConnected } = useAccount()
  const userUsdrifBalance = balances[USDRIF]
  const userUsdt0Balance = balances[USDT0]

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-row flex-wrap gap-x-6 gap-y-6 md:gap-x-20 items-center w-full">
        {isConnected && (
          <>
            <BalanceInfo
              className="w-[214px] min-w-[180px]"
              title="Your Wallet Balance"
              amount={isBalancesLoading ? '...' : userUsdrifBalance.formattedBalance}
              symbol={USDRIF}
            />
            <BalanceInfo
              className="w-[214px] min-w-[180px]"
              title="Your Wallet Balance"
              amount={isBalancesLoading ? '...' : userUsdt0Balance.formattedBalance}
              symbol={USDT0}
            />
          </>
        )}
        <BalanceInfo
          className="w-[214px] min-w-[180px]"
          title="Your Vault Balance"
          amount={isLoading ? '...' : formattedUserUsdrifBalance}
          symbol={USDRIF}
        />
        {isConnected && (
          <BalanceInfo
            className="w-[214px] min-w-[180px]"
            title="Your Share Balance"
            amount={isLoading ? '...' : formattedUserShares}
            symbol="Shares"
          />
        )}
      </div>

      <VaultActions />
    </div>
  )
}
