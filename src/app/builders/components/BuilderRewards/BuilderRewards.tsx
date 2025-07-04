import React from 'react'
import {
  BuilderAllTimeRewards,
  BuilderAllTimeShare,
  BuilderClaimableRewards,
  BuilderEstimatedRewards,
  BuilderLastCycleRewards,
  BuilderRewardDetails,
} from '@/app/collective-rewards/rewards'
import { BuilderMetricCard } from './BuilderMetricCard'

interface BuilderRewardsProps extends BuilderRewardDetails {
  className?: string
}

export const BuilderRewards: React.FC<BuilderRewardsProps> = ({ 
  className = '',
  builder,
  gauge,
  tokens: { rif, rbtc },
  ...rest
}) => {
  return (
    <div 
      className={`builder-rewards-container ${className}`} 
      style={{ 
        display: 'flex',
        width: '1144px',
        padding: '24px 24px 40px 24px',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '40px',
        borderRadius: '4px',
        background: 'var(--Background-80, #25211E)',
      }}
    >
      {/* Builder Rewards Text */}
      <div style={{ width: '528px' }}>
        <h3 style={{ margin: 0, color: '#fff' }}>BUILDER REWARDS</h3>
      </div>

      {/* Metrics Container */}
      <div style={{ 
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        alignSelf: 'stretch',
      }}>
        {/* Unclaimed */}
        <BuilderMetricCard 
          title="Unclaimed"
          showClaimButton
          onClaimClick={() => alert('Claim Rewards (placeholder - to be implemented in separate task)')}
        >
          <BuilderClaimableRewards 
            builder={builder}
            gauge={gauge}
            tokens={{ rif, rbtc }}
            {...rest}
          />
        </BuilderMetricCard>

        {/* Estimated this cycle */}
        <BuilderMetricCard title="Estimated this cycle ?">
          <BuilderEstimatedRewards 
            builder={builder}
            gauge={gauge}
            tokens={{ rif, rbtc }}
            {...rest}
          />
        </BuilderMetricCard>

        {/* Last cycle */}
        <BuilderMetricCard title="Last cycle">
          <BuilderLastCycleRewards 
            gauge={gauge}
            tokens={{ rif, rbtc }}
            {...rest}
          />
        </BuilderMetricCard>

        {/* Total earned */}
        <BuilderMetricCard title="Total earned">
          <BuilderAllTimeRewards 
            gauge={gauge}
            tokens={{ rif, rbtc }}
            {...rest}
          />
        </BuilderMetricCard>

        {/* All time share */}
        <BuilderMetricCard title="All time share ?">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <BuilderAllTimeShare 
              gauge={gauge}
              tokens={{ rif, rbtc }}
              {...rest}
            />
          </div>
        </BuilderMetricCard>
      </div>

      {/* Need to adjust backers' rewards? */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: '#aaa',
        fontSize: '15px',
      }}>
        <span role="img" aria-label="info">💡</span>
        Need to adjust your backers' rewards?
      </div>
    </div>
  )
}
