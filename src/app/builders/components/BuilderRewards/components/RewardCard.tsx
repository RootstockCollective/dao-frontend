import { BuilderRewardDetails } from '@/app/collective-rewards/rewards'
import { MetricsCard, MetricsCardTitle, TokenMetricsCardRow } from './BuilderMetricsCard'
import { useBuilderAllTimeRewards } from '../hooks/useBuilderAllTimeRewards'
import { useBuilderAllTimeShare } from '../hooks/useBuilderAllTimeShare'
import { useBuilderLastCycleRewards } from '../hooks/useBuilderLastCycleRewards'
import { useBuilderEstimatedRewards } from '../hooks/useBuilderEstimatedRewards'
import { useBuilderUnclaimedRewards } from '../hooks/useBuilderUnclaimedRewards'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header } from '@/components/TypographyNew'
import { FC, ReactNode } from 'react'

export type RewardType = 'unclaimed' | 'allTimeRewards' | 'lastCycle' | 'estimatedThisCycle' | 'allTimeShare'

interface RewardCardConfig {
  title: string
  dataTestId: string
  tooltip: string | ReactNode
  tooltipProps?: {
    popoverProps?: { size: 'medium' | 'small' }
  }
  requiresBuilder?: boolean
  isShareType?: boolean
}

const REWARD_CONFIGS: Record<RewardType, RewardCardConfig> = {
  unclaimed: {
    title: 'Unclaimed',
    dataTestId: 'Unclaimed',
    tooltip: 'Your rewards available to claim',
    requiresBuilder: true,
  },
  allTimeRewards: {
    title: 'Total earned',
    dataTestId: 'AllTimeRewards',
    tooltip: 'Your total rewards earned across all cycles',
  },
  lastCycle: {
    title: 'Last cycle',
    dataTestId: 'LastCycle',
    tooltip: 'Your rewards from the previous cycle',
  },
  estimatedThisCycle: {
    title: 'Estimated this cycle',
    dataTestId: 'EstimatedThisCycle',
    tooltip: (
      <>
        Your estimated rewards which will become claimable at the start of the next Cycle.
        <br />
        <br />
        The displayed information is dynamic and may vary based on total rewards and user activity. This data
        is for informational purposes only.
      </>
    ),
    tooltipProps: { popoverProps: { size: 'medium' } },
    requiresBuilder: true,
  },
  allTimeShare: {
    title: 'All time share',
    dataTestId: 'AllTimeShare',
    tooltip: 'Your percentage share of total rewards across all cycles',
    isShareType: true,
  },
}

interface RewardCardProps {
  type: RewardType
  tokens: BuilderRewardDetails['tokens']
  builder?: BuilderRewardDetails['builder']
  gauge: BuilderRewardDetails['gauge']
  gauges: BuilderRewardDetails['gauges']
  currency?: string
}

const RewardCardContent: FC<RewardCardProps> = ({ type, tokens, builder, gauge, gauges, currency }) => {
  const config = REWARD_CONFIGS[type]
  const { rif, rbtc } = tokens

  // Call all hooks at the top level to follow Rules of Hooks
  const unclaimedData = useBuilderUnclaimedRewards({
    builder: builder!,
    gauge,
    tokens: { rif, rbtc },
    currency,
  })
  const allTimeRewardsData = useBuilderAllTimeRewards({ gauge, tokens: { rif, rbtc }, currency })
  const lastCycleData = useBuilderLastCycleRewards({ gauge, tokens: { rif, rbtc }, currency })
  const estimatedData = useBuilderEstimatedRewards({
    builder: builder!,
    gauge,
    tokens: { rif, rbtc },
    currency,
  })
  const allTimeShareData = useBuilderAllTimeShare({ gauge, gauges, tokens: { rif } })

  // Get the appropriate data based on type
  const getRewardData = () => {
    switch (type) {
      case 'unclaimed':
        return unclaimedData
      case 'allTimeRewards':
        return allTimeRewardsData
      case 'lastCycle':
        return lastCycleData
      case 'estimatedThisCycle':
        return estimatedData
      case 'allTimeShare':
        return allTimeShareData
      default:
        throw new Error(`Unknown reward type: ${type}`)
    }
  }

  const rewardData = getRewardData()

  if (config.isShareType) {
    const { amount, isLoading } = rewardData as { amount: string; isLoading: boolean }

    return (
      <MetricsCard borderless>
        <MetricsCardTitle
          title={config.title}
          data-testid={config.dataTestId}
          tooltip={{ text: config.tooltip }}
        />
        <div className="flex items-center gap-4">
          {isLoading ? (
            <LoadingSpinner size="small" />
          ) : (
            <Header
              variant="h2"
              className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--color-v3-text-100)]"
            >
              {amount}
            </Header>
          )}
        </div>
      </MetricsCard>
    )
  }

  // Token-based rewards (RIF and RBTC)
  const { rif: rifData, rbtc: rbtcData } = rewardData as {
    rif: { amount: string; fiatAmount: string; isLoading: boolean }
    rbtc: { amount: string; fiatAmount: string; isLoading: boolean }
  }

  const RifRow = withSpinner(TokenMetricsCardRow, { size: 'small' })
  const RbtcRow = withSpinner(TokenMetricsCardRow, { size: 'small' })

  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title={config.title}
        data-testid={config.dataTestId}
        tooltip={{ text: config.tooltip, ...config.tooltipProps }}
      />
      <RifRow
        amount={rifData.amount}
        fiatAmount={rifData.fiatAmount}
        symbol={rif.symbol}
        isLoading={rifData.isLoading}
      />
      <RbtcRow
        amount={rbtcData.amount}
        fiatAmount={rbtcData.fiatAmount}
        symbol={rbtc.symbol}
        isLoading={rbtcData.isLoading}
      />
    </MetricsCard>
  )
}

export const RewardCard: FC<RewardCardProps> = ({ type, tokens, builder, gauge, gauges, currency }) => {
  return (
    <RewardCardContent
      type={type}
      tokens={tokens}
      builder={builder}
      gauge={gauge}
      gauges={gauges}
      currency={currency}
    />
  )
}
