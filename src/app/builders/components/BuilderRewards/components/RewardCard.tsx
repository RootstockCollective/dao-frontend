import {
  BuilderRewardDetails,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
} from '@/app/collective-rewards/rewards'
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
  mockData: {
    rif?: { amount: string; fiatAmount: string }
    rbtc?: { amount: string; fiatAmount: string }
    share?: string
  }
  requiresBuilder?: boolean
  isShareType?: boolean
}

const REWARD_CONFIGS: Record<RewardType, RewardCardConfig> = {
  unclaimed: {
    title: 'Unclaimed',
    dataTestId: 'Unclaimed',
    tooltip: 'Your rewards available to claim',
    mockData: {
      rif: { amount: '1,234.56', fiatAmount: '2,469.12 USD' },
      rbtc: { amount: '0.85', fiatAmount: '1,700.00 USD' },
    },
    requiresBuilder: true,
  },
  allTimeRewards: {
    title: 'Total earned',
    dataTestId: 'AllTimeRewards',
    tooltip: 'Your total rewards earned across all cycles',
    mockData: {
      rif: { amount: '12,345.67', fiatAmount: '24,691.34 USD' },
      rbtc: { amount: '8.75', fiatAmount: '17,500.00 USD' },
    },
  },
  lastCycle: {
    title: 'Last cycle',
    dataTestId: 'LastCycle',
    tooltip: 'Your rewards from the previous cycle',
    mockData: {
      rif: { amount: '890.12', fiatAmount: '1,780.24 USD' },
      rbtc: { amount: '0.65', fiatAmount: '1,300.00 USD' },
    },
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
    mockData: {
      rif: { amount: '567.89', fiatAmount: '1,135.78 USD' },
      rbtc: { amount: '0.42', fiatAmount: '840.00 USD' },
    },
    requiresBuilder: true,
  },
  allTimeShare: {
    title: 'All time share',
    dataTestId: 'AllTimeShare',
    tooltip: 'Your percentage share of total rewards across all cycles',
    mockData: {
      share: '15.7%',
    },
    isShareType: true,
  },
}

interface RewardCardProps {
  type: RewardType
  isMock?: boolean
  tokens: BuilderRewardDetails['tokens']
  builder?: BuilderRewardDetails['builder']
  gauge: BuilderRewardDetails['gauge']
  gauges: BuilderRewardDetails['gauges']
  currency?: string
}

const RewardCardContent: FC<Omit<RewardCardProps, 'isMock'>> = ({
  type,
  tokens,
  builder,
  gauge,
  gauges,
  currency,
}) => {
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {isLoading ? (
            <LoadingSpinner size="small" />
          ) : (
            <Header
              variant="e3"
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
                color: 'var(--color-v3-text-100)',
                textOverflow: 'ellipsis',
              }}
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

export const RewardCard: FC<RewardCardProps> = ({
  type,
  isMock = false,
  tokens,
  builder,
  gauge,
  gauges,
  currency,
}) => {
  const config = REWARD_CONFIGS[type]

  if (isMock) {
    if (config.isShareType) {
      return (
        <MetricsCard borderless>
          <MetricsCardTitle
            title={config.title}
            data-testid={config.dataTestId}
            tooltip={{ text: config.tooltip }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <Header
              variant="e3"
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
                color: 'var(--color-v3-text-100)',
                textOverflow: 'ellipsis',
              }}
            >
              {config.mockData.share}
            </Header>
          </div>
        </MetricsCard>
      )
    }

    return (
      <MetricsCard borderless>
        <MetricsCardTitle
          title={config.title}
          data-testid={config.dataTestId}
          tooltip={{ text: config.tooltip, ...config.tooltipProps }}
        />
        {config.mockData.rif && (
          <TokenMetricsCardRow
            amount={config.mockData.rif.amount}
            fiatAmount={config.mockData.rif.fiatAmount}
            symbol={tokens.rif.symbol}
          />
        )}
        {config.mockData.rbtc && (
          <TokenMetricsCardRow
            amount={config.mockData.rbtc.amount}
            fiatAmount={config.mockData.rbtc.fiatAmount}
            symbol={tokens.rbtc.symbol}
          />
        )}
      </MetricsCard>
    )
  }

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
