import { BuilderRewardDetails, MetricsCard, MetricsCardTitle } from '@/app/collective-rewards/rewards'
import { FC } from 'react'

type AllTimeShareProps = Omit<BuilderRewardDetails, 'builder'>

export const AllTimeShare: FC<AllTimeShareProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
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
