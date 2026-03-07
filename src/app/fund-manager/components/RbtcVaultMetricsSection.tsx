'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Paragraph } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import { useRbtcPendingCapitalMetrics } from '../hooks/useRbtcPendingCapitalMetrics'
import { RbtcVaultMetricCard } from './RbtcVaultMetricCard'
import { RbtcVaultMetricsRow } from './RbtcVaultMetricsRow'

export const RbtcVaultMetricsSection = () => {
  const {
    pendingDepositCapital,
    pendingWithdrawalCapital,
    netPendingCapital,
    isLoading: isLoadingPendingCapitalMetrics,
    error: errorPendingCapitalMetrics,
  } = useRbtcPendingCapitalMetrics()

  const isLoading = isLoadingPendingCapitalMetrics
  const error = errorPendingCapitalMetrics

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 rounded-sm bg-v3-bg-accent-80 w-full min-h-[180px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 rounded-sm bg-v3-bg-accent-80 w-full min-h-[180px]">
        <Paragraph variant="body" className="text-st-error">
          Failed to load vault metrics. Please try again later.
        </Paragraph>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 items-start p-6 rounded-sm bg-v3-bg-accent-80 w-full">
      {/* Row 1 */}
      <RbtcVaultMetricsRow>
        <></>
      </RbtcVaultMetricsRow>

      {/* Row 2 */}
      <RbtcVaultMetricsRow>
        <></>
      </RbtcVaultMetricsRow>

      {/* Row 3 */}
      <RbtcVaultMetricsRow>
        <RbtcVaultMetricCard
          title="Pending Deposit Capital"
          tooltipContent=""
          amount={pendingDepositCapital.amount}
          tokenSymbol={RBTC}
          fiatAmount={pendingDepositCapital.fiatAmount}
        />
        <RbtcVaultMetricCard
          title="Pending Withdrawal Capital"
          tooltipContent=""
          amount={pendingWithdrawalCapital.amount}
          tokenSymbol={RBTC}
          fiatAmount={pendingWithdrawalCapital.fiatAmount}
        />
        <RbtcVaultMetricCard
          title="Net Pending Capital"
          tooltipContent=""
          amount={netPendingCapital.amount}
          tokenSymbol={RBTC}
          fiatAmount={netPendingCapital.fiatAmount}
        />
        <div className="flex-1" />
      </RbtcVaultMetricsRow>
    </div>
  )
}
