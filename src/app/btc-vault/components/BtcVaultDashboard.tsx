'use client'

import Link from 'next/link'
import { type ReactNode } from 'react'
import { useAccount } from 'wagmi'

import { SectionContainer } from '@/app/communities/components/SectionContainer'
import { BalanceInfo } from '@/components/BalanceInfo'
import { HistoryIcon } from '@/components/Icons'
import { Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { btcVaultRequestHistory } from '@/shared/constants/routes'

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
interface BtcVaultDashboardProps {
  onRequestSubmitted?: () => void
}

export const BtcVaultDashboard = ({ onRequestSubmitted }: BtcVaultDashboardProps) => {
  const { address, isConnected } = useAccount()
  const { data, isLoading, isError } = useUserPosition(address)

  if (!address || !isConnected) return null

  return (
    <SectionContainer title="MY METRICS" className="w-full">
      <div className="flex flex-col gap-10" data-testid="btc-vault-dashboard">
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
          <div className="w-full md:w-[214px] md:min-w-[180px]">
            <BalanceInfo
              title="Principal deposited"
              amount={metricAmount(isLoading, isError, data?.totalDepositedPrincipalFormatted)}
              symbol={RBTC}
              fiatAmount={isLoading || isError ? undefined : data?.fiatPrincipalDeposited}
              data-testid="metric-principal"
            />
            <Link
              href={btcVaultRequestHistory}
              className="mt-6 flex items-center gap-x-1 text-sm font-medium underline underline-offset-2"
              data-testid="btc-vault-history-link"
            >
              <HistoryIcon />
              <Span variant="body-s">View history</Span>
            </Link>
          </div>
          <BalanceInfo
            className="w-full md:w-[214px] md:min-w-[180px]"
            title="Current earnings"
            amount={metricAmount(isLoading, isError, data?.currentEarningsFormatted)}
            symbol={RBTC}
            fiatAmount={isLoading || isError ? undefined : data?.fiatCurrentEarnings}
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

      <div className="mt-10" data-testid="btc-vault-actions">
        <BtcVaultActions onRequestSubmitted={onRequestSubmitted} />
      </div>
    </SectionContainer>
  )
}
