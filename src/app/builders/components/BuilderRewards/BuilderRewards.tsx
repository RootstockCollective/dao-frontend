import React from 'react'
import { Address } from 'viem'
import {
  BuilderAllTimeRewards,
  BuilderAllTimeShare,
  BuilderClaimableRewards,
  BuilderEstimatedRewards,
  BuilderLastCycleRewards,
  BuilderRewardDetails,
  useClaimBuilderRewards,
} from '@/app/collective-rewards/rewards'
import { Popover } from '@/components/Popover'
import { Button } from '@/components/Button'

interface BuilderRewardsProps extends BuilderRewardDetails {
  className?: string
}

export const BuilderRewards: React.FC<BuilderRewardsProps> = ({ 
  className = '',
  builder,
  gauge,
  gauges,
  tokens,
  currency = 'USD',
}) => {
  const { isClaimable, claimRewards, isPaused } = useClaimBuilderRewards(builder, gauge, {
    rif: tokens.rif.address,
    rbtc: tokens.rbtc.address,
  })

  const rewardDetails = {
    builder,
    gauge,
    gauges,
    tokens,
    currency,
  }

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
          <div style={{ width: '100%' }}>
            <BuilderClaimableRewards {...rewardDetails} />
          </div>
          <Popover
            content={
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                <p data-testid="adjustBackerRewardPctTooltip">You cannot be paused to claim rewards</p>
              </div>
            }
            disabled={!isPaused}
          >
            <Button
              className="w-full mt-auto"
              onClick={() => claimRewards()}
              disabled={!isClaimable || isPaused}
              variant="secondary"
              buttonProps={{
                style: {
                  marginTop: 'auto',
                  padding: '8px 16px',
                  border: '1px solid #fff',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: '#fff',
                  cursor: isClaimable && !isPaused ? 'pointer' : 'not-allowed',
                  opacity: isClaimable && !isPaused ? 1 : 0.5,
                  fontSize: '14px',
                }
              }}
            >
              Claim Rewards
            </Button>
          </Popover>
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
          <div style={{ width: '100%' }}>
            <BuilderEstimatedRewards {...rewardDetails} />
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
          <div style={{ width: '100%' }}>
            <BuilderLastCycleRewards {...rewardDetails} />
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
          <div style={{ width: '100%' }}>
            <BuilderAllTimeRewards {...rewardDetails} />
          </div>
          <span style={{ 
            color: '#aaa', 
            fontSize: '13px', 
            marginTop: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            cursor: 'pointer',
          }}>
            <span role="img" aria-label="history">🕑</span> See Rewards history
          </span>
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
          <div style={{ width: '100%' }}>
            <BuilderAllTimeShare {...rewardDetails} />
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
