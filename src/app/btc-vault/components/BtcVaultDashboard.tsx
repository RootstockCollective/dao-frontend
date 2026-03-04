'use client'

import { useAccount } from 'wagmi'

import { BalanceInfo } from '@/components/BalanceInfo'
import { MetricsContainer } from '@/components/containers/MetricsContainer'
import { Header, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import { useUserPosition } from '../hooks/useUserPosition/useUserPosition'
import { BtcVaultActions } from './BtcVaultActions'

const LoadingValue = () => <Span className="animate-pulse text-text-60">0</Span>

/**
 * Investor dashboard showing 7 position metrics in two rows.
 * Returns null when wallet is disconnected so the page section renders empty.
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
            tooltipContent="Your rBTC balance available in your connected wallet"
            data-testid="Metric-Wallet"
          />
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Vault shares"
            amount={isLoading ? <LoadingValue /> : data?.vaultTokensFormatted}
            symbol={RBTC}
            fiatAmount={isLoading ? undefined : data?.fiatVaultShares}
            tooltipContent="Your share tokens representing deposited rBTC in the vault"
            data-testid="Metric-VaultShares"
          />
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Your share of vault"
            amount={isLoading ? <LoadingValue /> : data?.percentOfVaultFormatted}
            tooltipContent="Your ownership percentage of the total vault assets"
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
            tooltipContent="Current total value of your vault position based on NAV"
            data-testid="Metric-TotalBalance"
          />
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Yield % to date"
            amount={isLoading ? <LoadingValue /> : data?.yieldPercentToDateFormatted}
            tooltipContent="Cumulative yield earned on your deposited principal"
            data-testid="Metric-YieldPercent"
          />
        </div>
      </MetricsContainer>

      {data && data.vaultTokensRaw > 0n && (
        <div className="flex justify-between w-full" data-testid="NavLinks">
          {/* TODO(DAO-1999): replace href with route to transaction history page */}
          <a href="#" className="text-sm font-medium underline underline-offset-2">
            <Span variant="body-s">View history →</Span>
          </a>
          {/* TODO(DAO-1999): replace href with route to yield history page */}
          <a href="#" className="text-sm font-medium underline underline-offset-2">
            <Span variant="body-s">View yield history →</Span>
          </a>
        </div>
      )}

      <BtcVaultActions address={address} />
    </section>
  )
}
