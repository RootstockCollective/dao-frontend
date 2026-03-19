'use client'

import Link from 'next/link'
import { useMemo } from 'react'

import { getFiatAmount } from '@/app/shared/formatter'
import { HistoryIcon, KotoQuestionMarkIcon } from '@/components/Icons'
import { TokenImage } from '@/components/TokenImage'
import { Tooltip } from '@/components/Tooltip'
import { Header, Label, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { formatCurrencyWithLabel } from '@/lib/utils'
import { btcVaultDepositHistory } from '@/shared/constants/routes'
import { usePricesContext } from '@/shared/context'

import { useEpochState } from '../hooks/useEpochState'
import { useVaultMetrics } from '../hooks/useVaultMetrics'
import { formatDateClosingOn, formatDateMonthFirst } from '../services/ui/formatters'

const PLACEHOLDER = '—'
const APY_TOOLTIP = 'Annual Percentage Yield — the annualized return on deposited rBTC'
const TVL_TOOLTIP = 'Total Value Locked — aggregate rBTC held by the vault'
const DEPOSIT_WINDOW_TOOLTIP = 'Current deposit window closes at this date'
const PRICE_PER_SHARE_TOOLTIP = 'Price of one vault share in rBTC terms (NAV per share)'

interface MetricColumnProps {
  label: string
  tooltipContent: string
  primary: React.ReactNode
  'data-testid': string
  className?: string
  secondary?: React.ReactNode
  symbol?: string
}

function MetricColumn({
  label,
  tooltipContent,
  primary,
  secondary,
  symbol,
  'data-testid': dataTestId,
  className,
}: MetricColumnProps) {
  return (
    <div className={className} data-testid={dataTestId}>
      <div className="flex items-center flex-row gap-2">
        <Label variant="tag" className="text-bg-0" data-testid="Title">
          {label}
        </Label>
        <Tooltip text={tooltipContent}>
          <KotoQuestionMarkIcon className="mb-1 hover:cursor-help" data-testid="TooltipIcon" />
        </Tooltip>
      </div>
      <div className="flex items-center flex-row gap-2 md:mt-2 mt-4">
        <Header variant="h1" className="flex items-end flex-row gap-2 leading-none! font-bold">
          {primary}
        </Header>
        {symbol ? (
          <div className="flex items-center flex-row gap-1">
            <TokenImage symbol={symbol} size={24} />
            <Span variant="body-l" bold>
              {symbol}
            </Span>
          </div>
        ) : null}
      </div>
      {secondary != null && secondary !== '' && (
        <Label variant="body-s" className="text-bg-0 mt-1 block" data-testid="Secondary">
          {secondary}
        </Label>
      )}
    </div>
  )
}

export const BtcVaultMetrics = () => {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useVaultMetrics()
  const { data: epoch } = useEpochState()
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const tvlFormatted = metrics?.tvlFormatted ?? PLACEHOLDER
  const tvlPercentFormatted = metrics?.tvlPercentFormatted ?? PLACEHOLDER
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
    return formatCurrencyWithLabel(getFiatAmount(metrics.pricePerShareRaw, rbtcPrice))
  }, [metrics?.pricePerShareRaw, rbtcPrice])

  const depositWindowLabel = useMemo(
    () => (epoch?.epochId != null ? `Deposit window ${epoch.epochId}` : 'Deposit window'),
    [epoch?.epochId],
  )
  const depositWindowValue = useMemo(() => {
    if (isMetricsLoading || !epoch) return PLACEHOLDER
    if (epoch.status === 'open' && epoch.endTime != null) {
      return `closing on ${formatDateClosingOn(epoch.endTime)}`
    }
    return PLACEHOLDER
  }, [epoch, isMetricsLoading])

  const lastUpdatedFormatted = useMemo(() => {
    if (!metrics?.timestamp) return null
    return `Last updated on ${formatDateMonthFirst(metrics.timestamp)}`
  }, [metrics?.timestamp])

  return (
    <div className="flex flex-col gap-6 w-full" data-testid="btc-vault-metrics-content">
      <div className="flex flex-row flex-wrap gap-6" data-testid="btc-vault-metrics-row">
        <MetricColumn
          className="w-[214px] min-w-[180px]"
          label="TVL"
          tooltipContent={TVL_TOOLTIP}
          primary={
            isMetricsLoading ? (
              '...'
            ) : (
              <>
                {tvlFormatted} rBTC | {tvlPercentFormatted}
              </>
            )
          }
          secondary={isMetricsLoading ? undefined : (tvlUsd ?? undefined)}
          data-testid="btc-vault-tvl"
        />
        <MetricColumn
          className="w-[214px] min-w-[180px]"
          label="APY (est.)"
          tooltipContent={APY_TOOLTIP}
          primary={isMetricsLoading ? '...' : `${apyFormatted}%`}
          secondary={isMetricsLoading ? undefined : (lastUpdatedFormatted ?? undefined)}
          data-testid="btc-vault-apy"
        />
        <MetricColumn
          className="w-[214px] min-w-[180px]"
          label={depositWindowLabel}
          tooltipContent={DEPOSIT_WINDOW_TOOLTIP}
          primary={depositWindowValue}
          data-testid="btc-vault-deposit-window"
        />
        <MetricColumn
          className="w-[214px] min-w-[180px]"
          label="Price per Share"
          tooltipContent={PRICE_PER_SHARE_TOOLTIP}
          primary={isMetricsLoading ? '...' : pricePerShareFormatted}
          symbol={isMetricsLoading ? undefined : RBTC}
          secondary={isMetricsLoading ? undefined : (pricePerShareUsd ?? undefined)}
          data-testid="btc-vault-price-per-share"
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
