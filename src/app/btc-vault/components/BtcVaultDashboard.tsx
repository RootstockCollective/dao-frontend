'use client'

import { useAccount } from 'wagmi'

import { BalanceInfo } from '@/components/BalanceInfo'
import { MetricsContainer } from '@/components/containers/MetricsContainer'
import { Header, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import { useUserPosition } from '../hooks/useUserPosition/useUserPosition'

const LoadingValue = () => <Span className="animate-pulse text-text-60">0</Span>

/**
 * Investor dashboard showing 7 position metrics in two rows.
 * Returns null when wallet is disconnected — the F4 section renders empty.
 */
export const BtcVaultDashboard = () => {
  const { address, isConnected } = useAccount()
  const { data, isLoading } = useUserPosition(address)

  if (!address || !isConnected) return null

  return (
    <section className="flex flex-col gap-4 w-full" data-testid="btc-vault-dashboard">
      <Header variant="h2" data-testid="MyMetricsTitle">
        MY METRICS
      </Header>

      <MetricsContainer className="divide-y-0">
        {/* Row 1: Wallet, Vault shares, Share of vault */}
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-6 w-full">
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Wallet"
            amount={isLoading ? <LoadingValue /> : data?.rbtcBalanceFormatted}
            symbol={RBTC}
            fiatAmount={isLoading ? undefined : data?.fiatWalletBalance}
            data-testid="Metric-Wallet"
          />
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Vault shares"
            amount={isLoading ? <LoadingValue /> : data?.vaultTokensFormatted}
            symbol={RBTC}
            fiatAmount={isLoading ? undefined : data?.fiatVaultShares}
            data-testid="Metric-VaultShares"
          />
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Your share of vault"
            amount={isLoading ? <LoadingValue /> : data?.percentOfVaultFormatted}
            data-testid="Metric-ShareOfVault"
          />
        </div>

        {/* Row 2: Principal, Current earnings, Total balance, Yield % */}
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-6 w-full">
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Principal deposited"
            amount={isLoading ? <LoadingValue /> : data?.totalDepositedPrincipalFormatted}
            symbol={RBTC}
            fiatAmount={isLoading ? undefined : data?.fiatPrincipalDeposited}
            data-testid="Metric-Principal"
          />
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Current earnings"
            amount={isLoading ? <LoadingValue /> : data?.currentEarningsFormatted}
            symbol={RBTC}
            tooltipContent="Subject to NAV updates, pending deposit windows"
            data-testid="Metric-Earnings"
          />
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Total balance"
            amount={isLoading ? <LoadingValue /> : data?.totalBalanceFormatted}
            symbol={RBTC}
            fiatAmount={isLoading ? undefined : data?.fiatTotalBalance}
            data-testid="Metric-TotalBalance"
          />
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Yield % to date"
            amount={isLoading ? <LoadingValue /> : data?.yieldPercentToDateFormatted}
            data-testid="Metric-YieldPercent"
          />
        </div>
      </MetricsContainer>
    </section>
  )
}
