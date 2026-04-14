'use client'

import Link from 'next/link'
import { useMemo } from 'react'

import { getFiatAmount } from '@/app/shared/formatter'
import { BalanceInfo } from '@/components/BalanceInfo'
import { HistoryIcon } from '@/components/Icons'
import { Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { formatCurrencyWithLabel } from '@/lib/utils'
import { btcVaultDepositHistory } from '@/shared/constants/routes'
import { usePricesContext } from '@/shared/context'

import { useEpochState } from '../../hooks/useEpochState'
import { useVaultMetrics } from '../../hooks/useVaultMetrics'
import { formatDateClosingOn, formatDateMonthFirst } from '../../services/ui/formatters'
import { lockedSharePriceToNavPerHumanShareWei } from '../../services/vaultShareNav'

const PLACEHOLDER = '—'
const APY_TOOLTIP = 'Annual Percentage Yield — the annualized return on deposited rBTC'
const TVL_TOOLTIP = 'Total Value Locked — aggregate rBTC held by the vault'
const DEPOSIT_WINDOW_TOOLTIP = 'Current deposit window closes at this date'
const PRICE_PER_SHARE_TOOLTIP = 'Price of one vault share in rBTC terms (NAV per share)'

export const BtcVaultMetrics = () => {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useVaultMetrics()
  const { data: epoch } = useEpochState()
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const tvlFormatted = metrics?.tvlFormatted ?? PLACEHOLDER
  const apyFormatted = metrics?.apyFormatted ?? PLACEHOLDER
  const pricePerShareFormatted = metrics?.pricePerShareFormatted ?? PLACEHOLDER
  const isMetricsLoading = metricsLoading || (!metrics && !metricsError)
  const showMetricsError = Boolean(metricsError)

  const tvlUsd = useMemo(() => {
    if (!metrics?.tvlRaw || !rbtcPrice) return null
    return formatCurrencyWithLabel(getFiatAmount(metrics.tvlRaw, rbtcPrice))
  }, [metrics?.tvlRaw, rbtcPrice])

  const pricePerShareUsd = useMemo(() => {
    if (!metrics?.pricePerShareRaw || !rbtcPrice) return null
    const perHumanShareWei = lockedSharePriceToNavPerHumanShareWei(metrics.pricePerShareRaw)
    return formatCurrencyWithLabel(getFiatAmount(perHumanShareWei, rbtcPrice))
  }, [metrics?.pricePerShareRaw, rbtcPrice])

  const depositWindowLabel = useMemo(
    () => (epoch?.epochId != null ? `Deposit window ${epoch.epochId}` : 'Deposit window'),
    [epoch?.epochId],
  )
  // Deposit window row: human-readable "closing on …" when epoch is open
  const depositWindowValue = useMemo(() => {
    if (isMetricsLoading || !epoch) return PLACEHOLDER
    if (epoch.status === 'open' && epoch.endTime != null) {
      return `closing on ${formatDateClosingOn(epoch.endTime)}`
    }
    return PLACEHOLDER
  }, [epoch, isMetricsLoading])

  // APY fiat line under the main amount
  const lastUpdatedFormatted = useMemo(() => {
    if (!metrics?.timestamp) return null
    return `Last updated on ${formatDateMonthFirst(metrics.timestamp)}`
  }, [metrics?.timestamp])

  const BALANCE_STYLE = 'w-[256px] min-w-[180px]'

  return (
    <div className="flex flex-col gap-6 w-full" data-testid="btc-vault-metrics-content">
      <div className="flex flex-row flex-wrap gap-6 w-full" data-testid="btc-vault-metrics-row">
        <BalanceInfo
          className={BALANCE_STYLE}
          title="TVL"
          tooltipContent={TVL_TOOLTIP}
          amount={isMetricsLoading ? '...' : tvlFormatted}
          symbol={isMetricsLoading ? undefined : RBTC}
          fiatAmount={isMetricsLoading ? undefined : (tvlUsd ?? undefined)}
          data-testid="btc-vault-tvl"
          headerVariant="h3"
        />
        <BalanceInfo
          className={BALANCE_STYLE}
          title="APY (est.)"
          tooltipContent={APY_TOOLTIP}
          amount={isMetricsLoading ? '...' : `${apyFormatted}%`}
          fiatAmount={isMetricsLoading ? undefined : (lastUpdatedFormatted ?? undefined)}
          data-testid="btc-vault-apy"
          headerVariant="h3"
        />
        <BalanceInfo
          className={BALANCE_STYLE}
          title={depositWindowLabel}
          tooltipContent={DEPOSIT_WINDOW_TOOLTIP}
          amount={depositWindowValue}
          data-testid="btc-vault-deposit-window"
          headerVariant="h3"
        />
        <BalanceInfo
          className={BALANCE_STYLE}
          title="Price per Share"
          tooltipContent={PRICE_PER_SHARE_TOOLTIP}
          amount={isMetricsLoading ? '...' : pricePerShareFormatted}
          symbol={isMetricsLoading ? undefined : RBTC}
          fiatAmount={isMetricsLoading ? undefined : (pricePerShareUsd ?? undefined)}
          data-testid="btc-vault-price-per-share"
          headerVariant="h3"
        />
      </div>

      {showMetricsError && (
        <p className="text-sm text-error" data-testid="btc-vault-metrics-error">
          Failed to load metrics. Please try again.
        </p>
      )}

      <div data-testid="btc-vault-history-link-section">
        <Link
          href={btcVaultDepositHistory}
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
