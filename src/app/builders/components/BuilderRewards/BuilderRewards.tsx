import React from 'react'
import {
  BuilderAllTimeRewards,
  BuilderAllTimeShare,
  BuilderClaimableRewards,
  BuilderEstimatedRewards,
  BuilderLastCycleRewards,
  BuilderRewardDetails,
} from '@/app/collective-rewards/rewards'

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
        <div style={{ 
          display: 'flex',
          paddingBottom: '2px',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
          flex: 1,
          minWidth: 0,
          padding: '24px',
          background: '#181818',
          borderRadius: '8px',
        }}>
          <span style={{ color: '#aaa', fontSize: '14px' }}>Unclaimed</span>
          <div style={{ flex: 1, width: '100%' }}>
            <BuilderClaimableRewards 
              builder={builder}
              gauge={gauge}
              tokens={{ rif, rbtc }}
              {...rest}
            />
          </div>
          <button 
            style={{ 
              width: '100%',
              marginTop: 'auto',
              padding: '8px 16px',
              border: '1px solid #fff',
              borderRadius: '4px',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            onClick={() => alert('Claim Rewards (placeholder - to be implemented in separate task)')}
          >
            Claim Rewards
          </button>
        </div>

        {/* Estimated this cycle */}
        <div style={{ 
          display: 'flex',
          paddingBottom: '2px',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
          flex: 1,
          minWidth: 0,
          padding: '24px',
          background: '#181818',
          borderRadius: '8px',
        }}>
          <span style={{ color: '#aaa', fontSize: '14px' }}>
            Estimated this cycle <span title="Info">?</span>
          </span>
          <div style={{ flex: 1, width: '100%' }}>
            <BuilderEstimatedRewards 
              builder={builder}
              gauge={gauge}
              tokens={{ rif, rbtc }}
              {...rest}
            />
          </div>
        </div>

        {/* Last cycle */}
        <div style={{ 
          display: 'flex',
          paddingBottom: '2px',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
          flex: 1,
          minWidth: 0,
          padding: '24px',
          background: '#181818',
          borderRadius: '8px',
        }}>
          <span style={{ color: '#aaa', fontSize: '14px' }}>Last cycle</span>
          <div style={{ flex: 1, width: '100%' }}>
            <BuilderLastCycleRewards 
              gauge={gauge}
              tokens={{ rif, rbtc }}
              {...rest}
            />
          </div>
        </div>

        {/* Total earned */}
        <div style={{ 
          display: 'flex',
          paddingBottom: '2px',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
          flex: 1,
          minWidth: 0,
          padding: '24px',
          background: '#181818',
          borderRadius: '8px',
        }}>
          <span style={{ color: '#aaa', fontSize: '14px' }}>Total earned</span>
          <div style={{ flex: 1, width: '100%' }}>
            <BuilderAllTimeRewards 
              gauge={gauge}
              tokens={{ rif, rbtc }}
              {...rest}
            />
          </div>
        </div>

        {/* All time share */}
        <div style={{ 
          display: 'flex',
          paddingBottom: '2px',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          alignSelf: 'stretch',
          flex: 1,
          minWidth: 0,
          padding: '24px',
          background: '#181818',
          borderRadius: '8px',
        }}>
          <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <BuilderAllTimeShare 
              gauge={gauge}
              tokens={{ rif, rbtc }}
              {...rest}
            />
          </div>
        </div>
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
