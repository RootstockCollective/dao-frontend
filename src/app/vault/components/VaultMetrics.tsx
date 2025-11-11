'use client'

import { MetricsContainer } from '@/components/containers'
import { BalanceInfo } from '@/components/BalanceInfo'
import { useVaultBalance } from '../hooks/useVaultBalance'
import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { useAccount } from 'wagmi'
import { formatSymbol, formatApy } from '@/app/shared/formatter'
import { USDRIF } from '@/lib/constants'
import { CircularProgress } from './CircularProgress'

/**
 * Component displaying vault metrics including balance and lending parameters
 */
export const VaultMetrics = () => {
  const { totalAssets, userBalance, estimatedApy, isLoading } = useVaultBalance()
  const { balances, isBalancesLoading } = useGetAddressBalances()
  const { isConnected } = useAccount()
  const userUsdrifBalance = balances[USDRIF]

  // Calculate percentage of vault owned by user
  const vaultPercentage = totalAssets > 0 ? (Number(userBalance) / Number(totalAssets)) * 100 : 0

  return (
    <MetricsContainer className="bg-v3-bg-accent-80">
      <div className="flex flex-col gap-6 w-full">
        {isConnected && (
          <div className="flex flex-row flex-wrap gap-6">
            <BalanceInfo
              className="max-w-[214px] min-w-[180px]"
              title="Your wallet balance"
              amount={isBalancesLoading ? '...' : userUsdrifBalance.formattedBalance}
              symbol="USDRIF"
            />
          </div>
        )}
        <div className="flex flex-row flex-wrap gap-6">
          <BalanceInfo
            className="max-w-[214px] min-w-[180px]"
            title="Vault Balance"
            amount={isLoading ? '...' : formatSymbol(totalAssets, 'USDRIF')}
            symbol="USDRIF"
          />
          <BalanceInfo
            className="max-w-[214px] min-w-[180px]"
            title="Total Supplied"
            amount={isLoading ? '...' : formatSymbol(userBalance, 'USDRIF')}
            symbol="USDRIF"
          />
          <BalanceInfo
            className="max-w-[214px] min-w-[180px]"
            title="APY"
            amount={isLoading ? '...' : formatApy(estimatedApy)}
            symbol="%"
          />
        </div>
        {isConnected && userBalance > 0 && (
          <div className="flex flex-col items-center gap-3 p-4 w-full">
            <h3 className="text-sm font-semibold text-v3-text-secondary uppercase tracking-wide">
              Your Vault Share
            </h3>
            <CircularProgress percentage={vaultPercentage} />
          </div>
        )}
      </div>
    </MetricsContainer>
  )
}
