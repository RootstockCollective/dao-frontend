import { BuilderRewardDetails } from '@/app/collective-rewards/rewards'
import { MetricsCard, MetricsCardTitle, TokenMetricsCardRow } from './BuilderMetricsCard'
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

interface RewardCardMockProps {
  type: RewardType
  tokens: BuilderRewardDetails['tokens']
  builder?: BuilderRewardDetails['builder']
  gauge: BuilderRewardDetails['gauge']
  gauges: BuilderRewardDetails['gauges']
  currency?: string
}

export const RewardCardMock: FC<RewardCardMockProps> = ({
  type,
  tokens,
  builder,
  gauge,
  gauges,
  currency,
}) => {
  const config = REWARD_CONFIGS[type]

  if (config.isShareType) {
    return (
      <MetricsCard borderless>
        <MetricsCardTitle
          title={config.title}
          data-testid={config.dataTestId}
          tooltip={{ text: config.tooltip }}
        />
        <div className="flex items-center gap-4">
          <Header
            variant="h2"
            className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--color-v3-text-100)]"
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
