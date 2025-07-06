import React from 'react'
import {
  BuilderRewardDetails,
} from '@/app/collective-rewards/rewards'
import {
  AllTimeRewards,
  AllTimeShare,
  ClaimableRewards,
  EstimatedRewards,
  LastCycleRewards,
} from './components'
import { BuilderMetricCard } from './BuilderMetricCard'
import { ClaimRewardsButton } from './buttons/ClaimRewardsButton'
import { SeeRewardsHistoryButton } from './buttons/SeeRewardsHistoryButton'

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
        <h3 style={{ 
          margin: 0, 
          color: 'var(--Text-100, #FFF)',
          fontFamily: 'KK-Topo',
          fontSize: '20px',
          fontStyle: 'normal',
          fontWeight: '400',
          lineHeight: '130%',
          letterSpacing: '0.4px',
          textTransform: 'uppercase'
        }}>BUILDER REWARDS</h3>
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
          showButton
          button={
            <ClaimRewardsButton 
              onClick={() => alert('Claim Rewards (placeholder - to be implemented in separate task)')}
            />
          }
        >
          <ClaimableRewards 
            builder={builder}
            gauge={gauge}
            tokens={{ rif, rbtc }}
            {...rest}
          />
        </BuilderMetricCard>

        {/* Estimated this cycle */}
        <BuilderMetricCard>
          <EstimatedRewards 
            builder={builder}
            gauge={gauge}
            tokens={{ rif, rbtc }}
            {...rest}
          />
        </BuilderMetricCard>

        {/* Last cycle */}
        <BuilderMetricCard>
          <LastCycleRewards 
            gauge={gauge}
            tokens={{ rif, rbtc }}
            {...rest}
          />
        </BuilderMetricCard>

        {/* Total earned */}
        <BuilderMetricCard 
          showButton
          button={
            <SeeRewardsHistoryButton 
              onClick={() => alert('See Rewards history (placeholder - to be implemented in separate task)')}
            />
          }
        >
          <AllTimeRewards 
            gauge={gauge}
            tokens={{ rif, rbtc }}
            {...rest}
          />
        </BuilderMetricCard>

        {/* All time share */}
        <BuilderMetricCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <AllTimeShare 
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
