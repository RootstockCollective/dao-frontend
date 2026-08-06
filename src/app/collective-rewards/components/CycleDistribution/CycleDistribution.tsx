'use client'

import { ComparativeProgressBar } from '@/components/ComparativeProgressBar/ComparativeProgressBar'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header, Label, Paragraph, Span } from '@/components/Typography'
import Big from '@/lib/big'
import { cn, formatCurrency } from '@/lib/utils'

import { formatSymbol } from '../../../shared/formatter'
import { REWARD_TOKEN_COLORS, SPLIT_COLORS } from '../../constants/dashboardColors'
import { CycleHistoryEntry, CycleTokenReward } from '../../types'
import { formatUsdWhole } from '../../utils/dashboardFormatters'

/** Shown wherever a USD figure is derived from spot prices rather than the price at distribution. */
export const SPOT_PRICE_NOTE = 'USD valued at current prices'

const TokenRow = ({ reward }: { reward: CycleTokenReward }) => (
  <li className="flex items-start justify-between gap-4 py-4 border-b border-v3-bg-accent-60 last:border-b-0">
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: REWARD_TOKEN_COLORS[reward.tokenKey] }}
      />
      <Span className="text-v3-text-100">{reward.symbol}</Span>
    </div>

    <div className="text-right">
      <Paragraph className="text-v3-text-100">{formatSymbol(reward.value, reward.symbol)}</Paragraph>
      <Span variant="body-xs" className="text-v3-text-40">
        {formatUsdWhole(reward.fiatValue)}
      </Span>
    </div>
  </li>
)

interface SplitSectionProps {
  rewardsFiat: Big
  backersShare: number
  backersCount: number | null
  buildersCount: number | null
}

const SplitSection = ({ rewardsFiat, backersShare, backersCount, buildersCount }: SplitSectionProps) => {
  const backersPct = Math.round(backersShare * 100)
  const buildersPct = 100 - backersPct

  const backersAverage =
    backersCount && backersCount > 0 ? rewardsFiat.mul(backersShare).div(backersCount) : null
  const buildersAverage =
    buildersCount && buildersCount > 0 ? rewardsFiat.mul(1 - backersShare).div(buildersCount) : null

  const averages = [
    backersAverage && `${formatCurrency(backersAverage)} avg per Backer`,
    buildersAverage && `${formatCurrency(buildersAverage)} per Builder`,
  ].filter(Boolean)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <Span variant="body-s" className="text-v3-text-100">
          Backers {backersPct}%
        </Span>
        <Span variant="body-s" className="text-v3-text-100">
          Builders {buildersPct}%
        </Span>
      </div>

      <ComparativeProgressBar
        segmented
        aria-label={`Backers ${backersPct}%, Builders ${buildersPct}%`}
        values={[
          { value: backersShare, color: SPLIT_COLORS.backers },
          { value: 1 - backersShare, color: SPLIT_COLORS.builders },
        ]}
      />

      {averages.length > 0 && (
        <Paragraph variant="body-xs" className="text-v3-text-40 pt-1">
          {averages.join(' · ')}
        </Paragraph>
      )}
    </div>
  )
}

export interface CycleDistributionProps {
  cycle: CycleHistoryEntry
  /**
   * Active Builders in the cycle. Only the running cycle can answer this today, so a past
   * cycle simply omits the per-Builder average rather than guessing from today's count.
   */
  buildersCount?: number | null
  isLoading?: boolean
  className?: string
}

export const CycleDistribution = ({
  cycle,
  buildersCount = null,
  isLoading = false,
  className,
}: CycleDistributionProps) => {
  // Largest contributor first — the panel is read top-down to answer "what made up this total".
  const rewards = [...cycle.rewards].sort((a, b) => b.fiatValue.cmp(a.fiatValue))

  return (
    <div
      className={cn('bg-v3-bg-accent-80 rounded-lg p-6 flex flex-col gap-6', className)}
      data-testid="cycle-distribution"
    >
      <div className="flex flex-col gap-2">
        <Label variant="tag-s" caps className="text-v3-text-40 tracking-wider">
          Distributed · Cycle {cycle.cycleNumber}
        </Label>
        {isLoading ? (
          <LoadingSpinner size="small" />
        ) : (
          <Header variant="h1" className="text-v3-text-100">
            {formatUsdWhole(cycle.rewardsFiat)}
          </Header>
        )}
      </div>

      <ul className="flex flex-col">
        {rewards.map(reward => (
          <TokenRow key={reward.tokenKey} reward={reward} />
        ))}
      </ul>

      {cycle.backersShare !== null && (
        <SplitSection
          rewardsFiat={cycle.rewardsFiat}
          backersShare={cycle.backersShare}
          backersCount={cycle.backersCount}
          buildersCount={buildersCount}
        />
      )}

      <Paragraph variant="body-xs" className="text-v3-text-40">
        {SPOT_PRICE_NOTE}
      </Paragraph>
    </div>
  )
}
