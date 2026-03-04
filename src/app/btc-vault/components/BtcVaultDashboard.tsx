'use client'

import { type ReactNode } from 'react'
import { useAccount } from 'wagmi'

import { BalanceInfo } from '@/components/BalanceInfo'
import { HistoryIcon } from '@/components/Icons'
import { Header, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import { useUserPosition } from '../hooks/useUserPosition/useUserPosition'
import { BtcVaultActions } from './BtcVaultActions'

const LoadingValue = () => <Span className="animate-pulse text-text-60">0</Span>

/** Resolves the display value for a metric based on query state. */
function metricAmount(isLoading: boolean, isError: boolean, value: string | undefined): ReactNode {
  if (isLoading) return <LoadingValue />
  if (isError || value === undefined) return '—'
  return value
}

/**
 * Investor dashboard showing 7 position metrics in two rows.
 * Returns null when wallet is disconnected so the page section renders empty.
 */
export const BtcVaultDashboard = () => {
  const { address, isConnected } = useAccount()
  const { data, isLoading, isError } = useUserPosition(address)

  if (!address || !isConnected) return null

  return (
    <section
      className="flex flex-col gap-6 w-full rounded-sm bg-v3-bg-accent-80 px-4 py-6 md:p-6"
      data-testid="btc-vault-dashboard"
    >
      <Header variant="h2" data-testid="btc-vault-my-metrics-title">
        MY METRICS
      </Header>

      <div className="flex flex-col gap-10">
        {/* Row 1: Wallet, Vault shares, Share of vault */}
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-6 w-full">
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Wallet"
            amount={metricAmount(isLoading, isError, data?.rbtcBalanceFormatted)}
            symbol={RBTC}
            fiatAmount={isLoading || isError ? undefined : data?.fiatWalletBalance}
            tooltipContent="Your rBTC balance available in your connected wallet"
            data-testid="metric-wallet"
          />
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Vault shares"
            amount={metricAmount(isLoading, isError, data?.vaultTokensFormatted)}
            symbol={RBTC}
            fiatAmount={isLoading || isError ? undefined : data?.fiatVaultShares}
            tooltipContent="Your share tokens representing deposited rBTC in the vault"
            data-testid="metric-vault-shares"
          />
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Your share of vault"
            amount={metricAmount(isLoading, isError, data?.percentOfVaultFormatted)}
            tooltipContent="Your ownership percentage of the total vault assets"
            data-testid="metric-share-of-vault"
          />
        </div>

        {/* Row 2: Principal, Current earnings, Total balance, Yield % */}
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-6 w-full">
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Principal deposited"
            amount={metricAmount(isLoading, isError, data?.totalDepositedPrincipalFormatted)}
            symbol={RBTC}
            fiatAmount={isLoading || isError ? undefined : data?.fiatPrincipalDeposited}
            data-testid="metric-principal"
          />
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Current earnings"
            amount={metricAmount(isLoading, isError, data?.currentEarningsFormatted)}
            symbol={RBTC}
            tooltipContent="Subject to NAV updates, pending deposit windows"
            data-testid="metric-earnings"
          />
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Total balance"
            amount={metricAmount(isLoading, isError, data?.totalBalanceFormatted)}
            symbol={RBTC}
            fiatAmount={isLoading || isError ? undefined : data?.fiatTotalBalance}
            tooltipContent="Current total value of your vault position based on NAV"
            data-testid="metric-total-balance"
          />
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Yield % to date"
            amount={metricAmount(isLoading, isError, data?.yieldPercentToDateFormatted)}
            tooltipContent="Cumulative yield earned on your deposited principal"
            data-testid="metric-yield-percent"
          />
        </div>
      </div>

      {data && data.vaultTokensRaw > 0n && (
        <div className="flex justify-between w-full" data-testid="btc-vault-nav-links">
          {/* TODO(DAO-1999): replace href with route to transaction history page */}
          <a href="#" className="flex items-center gap-x-1 text-sm font-medium underline underline-offset-2">
            <HistoryIcon />
            <Span variant="body-s">View history</Span>
          </a>
          {/* TODO(DAO-1999): replace href with route to yield history page */}
          <a href="#" className="flex items-center gap-x-1 text-sm font-medium underline underline-offset-2">
            <HistoryIcon />
            <Span variant="body-s">View yield history</Span>
          </a>
        </div>
      )}

      <BtcVaultActions address={address} />
    </section>
  )
}
