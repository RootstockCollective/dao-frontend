import { BuilderRewardDetails, MetricsCard, MetricsCardTitle } from '@/app/collective-rewards/rewards'
import { useBuilderAllTimeShare } from '../hooks'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { FC } from 'react'

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
          <div
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 1,
              overflow: 'hidden',
              color: 'var(--Text-100, #FFF)',
              textOverflow: 'ellipsis',
              fontFamily: 'KK-Topo',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: '130%',
              letterSpacing: '0.4px',
            }}
          >
            {amount}
          </div>
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
          <div
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 1,
              overflow: 'hidden',
              color: 'var(--Text-100, #FFF)',
              textOverflow: 'ellipsis',
              fontFamily: 'KK-Topo',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: '130%',
              letterSpacing: '0.4px',
            }}
          >
            15.7%
          </div>
        </div>
      </MetricsCard>
    )
  }

  return <AllTimeShareContent tokens={{ rif }} {...props} />
}
