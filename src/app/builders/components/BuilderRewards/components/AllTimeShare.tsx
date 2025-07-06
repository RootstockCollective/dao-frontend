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
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '16px 0',
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>15.7%</div>
        <div style={{ fontSize: '14px', color: '#aaa' }}>of total rewards</div>
      </div>
    </MetricsCard>
  )
}
