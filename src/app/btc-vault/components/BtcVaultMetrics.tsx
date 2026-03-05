'use client'

import { BalanceInfo } from '@/components/BalanceInfo'
import { Label } from '@/components/Typography'

import { useEpochState } from '../hooks/useEpochState'
import { useVaultMetrics } from '../hooks/useVaultMetrics'
import { formatTimestamp } from '../services/ui/formatters'

const PLACEHOLDER = '—'
const AUTO_COMPOUND_DISCLOSURE = 'Yield is automatically compounded into the vault NAV.'
const APY_DISCLAIMER = 'estimated / non-guaranteed'

export const BtcVaultMetrics = () => {
  const { data: metrics, isLoading: metricsLoading } = useVaultMetrics()
  const { data: epoch, isLoading: epochLoading } = useEpochState()

  const tvlFormatted = metrics?.tvlFormatted ?? PLACEHOLDER
  const apyFormatted = metrics?.apyFormatted ?? PLACEHOLDER
  const navFormatted = metrics?.navFormatted ?? PLACEHOLDER
  const timestamp = metrics?.timestamp
  const isMetricsLoading = metricsLoading || !metrics
  const isEpochLoading = epochLoading || !epoch

  const epochStatus = epoch?.status
  const isAcceptingRequests = epoch?.isAcceptingRequests ?? false
  const statusSummary = epoch?.statusSummary ?? ''
  const isNavPending = epochStatus === 'closed' || epochStatus === 'settling'

  return (
    <div className="flex flex-col gap-6 w-full" data-testid="btc-vault-metrics-content">
      <div className="flex flex-row flex-wrap gap-x-6 gap-y-6 md:gap-x-20">
        <BalanceInfo
          className="w-[214px] min-w-[180px]"
          title="TVL"
          amount={isMetricsLoading ? '...' : tvlFormatted}
          symbol="rBTC"
          data-testid="btc-vault-tvl"
        />
        <div className="w-[214px] min-w-[180px]" data-testid="btc-vault-apy">
          <BalanceInfo
            title="APY"
            amount={isMetricsLoading ? '...' : apyFormatted}
            symbol="%"
            tooltipContent={APY_DISCLAIMER}
            data-testid="BalanceInfo"
          />
          <Label variant="body-s" className="text-bg-0 mt-1 block" data-testid="apy-disclaimer">
            {APY_DISCLAIMER}
          </Label>
        </div>
        <div className="w-[214px] min-w-[180px]" data-testid="btc-vault-nav">
          <BalanceInfo
            title="NAV"
            amount={isMetricsLoading ? '...' : navFormatted}
            symbol="rBTC"
            data-testid="BalanceInfo"
          />
          {!isMetricsLoading && timestamp != null && (
            <Label variant="body-s" className="text-bg-0 mt-1 block" data-testid="nav-last-updated">
              Updated {formatTimestamp(timestamp, { includeTime: true })}
            </Label>
          )}
          {!isEpochLoading && isNavPending && (
            <Label variant="body-s" className="text-bg-0 mt-0.5 block" data-testid="nav-pending-indicator">
              Pending
            </Label>
          )}
        </div>
      </div>

      <div data-testid="btc-vault-apy-disclosure">
        <Label variant="body-s" className="text-bg-0">
          {AUTO_COMPOUND_DISCLOSURE}
        </Label>
      </div>

      <div data-testid="btc-vault-epoch-state">
        <Label variant="tag" className="text-bg-0" data-testid="epoch-state-label">
          Epoch:
        </Label>
        <Label variant="body-s" className="text-bg-0 mt-1 block" data-testid="epoch-state-value">
          {isEpochLoading
            ? '...'
            : isAcceptingRequests
              ? `Open – accepting requests${statusSummary ? ` (${statusSummary})` : ''}`
              : `Closed – settling${statusSummary ? ` (${statusSummary})` : ''}`}
        </Label>
      </div>
    </div>
  )
}
