'use client'

import Link from 'next/link'
import { useMemo } from 'react'

import { getFiatAmount } from '@/app/shared/formatter'
import { BalanceInfo } from '@/components/BalanceInfo'
import { HistoryIcon } from '@/components/Icons'
import { Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { formatCurrencyWithLabel } from '@/lib/utils'
import { btcVaultRequestHistory } from '@/shared/constants/routes'
import { usePricesContext } from '@/shared/context'

import { useEpochState } from '../hooks/useEpochState'
import { useVaultMetrics } from '../hooks/useVaultMetrics'

const PLACEHOLDER = '—'
const APY_TOOLTIP = 'Annual Percentage Yield — the annualized return on deposited rBTC'

export const BtcVaultMetrics = () => {
  const { data: metrics, isLoading: metricsLoading } = useVaultMetrics()
  const { data: epoch } = useEpochState()
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const tvlFormatted = metrics?.tvlFormatted ?? PLACEHOLDER
  const apyFormatted = metrics?.apyFormatted ?? PLACEHOLDER
  const pricePerShareFormatted = metrics?.pricePerShareFormatted ?? PLACEHOLDER
  const isMetricsLoading = metricsLoading || !metrics

  const tvlUsd = useMemo(() => {
    if (!metrics?.tvlRaw || !rbtcPrice) return null
    return formatCurrencyWithLabel(getFiatAmount(metrics.tvlRaw, rbtcPrice))
  }, [metrics?.tvlRaw, rbtcPrice])

  const pricePerShareUsd = useMemo(() => {
    if (!metrics?.pricePerShareRaw || !rbtcPrice) return null
    return formatCurrencyWithLabel(getFiatAmount(metrics.pricePerShareRaw, rbtcPrice))
  }, [metrics?.pricePerShareRaw, rbtcPrice])

  return (
    <div className="flex flex-col gap-6 w-full" data-testid="btc-vault-metrics-content">
      <div className="flex flex-row flex-wrap gap-6" data-testid="btc-vault-metrics-row">
        <BalanceInfo
          className="w-[214px] min-w-[180px]"
          title="TVL"
          amount={isMetricsLoading ? '...' : tvlFormatted}
          symbol={RBTC}
          fiatAmount={isMetricsLoading ? null : tvlUsd}
          tooltipContent="Total Value Locked — aggregate rBTC held by the vault"
          data-testid="btc-vault-tvl"
        />
        <BalanceInfo
          className="w-[214px] min-w-[180px]"
          title="APY"
          amount={isMetricsLoading ? '...' : apyFormatted}
          symbol="%"
          tooltipContent={APY_TOOLTIP}
          data-testid="btc-vault-apy"
        />
        <BalanceInfo
          className="w-[214px] min-w-[180px]"
          title={`Deposit window ${epoch?.epochId ?? ''}`}
          amount="closing on -"
          tooltipContent="Current epoch deposit window and its closing date"
          data-testid="btc-vault-deposit-window"
        />
        {/* Price Per Share = NAV per share (convertToAssets(1e18)) renamed for clarity */}
        <BalanceInfo
          className="w-[214px] min-w-[180px]"
          title="Price Per Share"
          amount={isMetricsLoading ? '...' : pricePerShareFormatted}
          symbol={RBTC}
          fiatAmount={isMetricsLoading ? null : pricePerShareUsd}
          tooltipContent="Price of one vault share in rBTC terms (NAV per share)"
          data-testid="btc-vault-price-per-share"
        />
      </div>

      <div data-testid="btc-vault-history-link-section">
        <Link
          href={btcVaultRequestHistory}
          className="flex items-center gap-x-1 text-sm font-medium text-text-100 underline underline-offset-2"
          data-testid="btc-vault-metrics-history-link"
        >
          <HistoryIcon />
          <Span variant="body-s" bold>
            View history
          </Span>
        </Link>
      </div>
    </div>
  )
}
