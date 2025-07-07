import { BuilderRewardDetails, MetricsCard, MetricsCardTitle } from '@/app/collective-rewards/rewards'
import { useBuilderAllTimeShare } from '../hooks'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { FC } from 'react'
import { Header } from '@/components/TypographyNew'

type AllTimeShareProps = Omit<BuilderRewardDetails, 'builder'> & { isMock?: boolean }

const AllTimeShareContent: FC<Omit<BuilderRewardDetails, 'builder'>> = ({ tokens: { rif }, ...props }) => {
  const { amount, isLoading } = useBuilderAllTimeShare({
    ...props,
    tokens: { rif },
  })

  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="All time share"
        data-testid="AllTimeShare"
        tooltip={{ text: 'Your percentage share of total rewards across all cycles' }}
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

export const AllTimeShare: FC<AllTimeShareProps> = ({ isMock = false, tokens: { rif }, ...props }) => {
  if (isMock) {
    return (
      <MetricsCard borderless>
        <MetricsCardTitle
          title="All time share"
          data-testid="AllTimeShare"
          tooltip={{ text: 'Your percentage share of total rewards across all cycles' }}
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
            15.7%
          </Header>
        </div>
      </MetricsCard>
    )
  }

  return <AllTimeShareContent tokens={{ rif }} {...props} />
}
