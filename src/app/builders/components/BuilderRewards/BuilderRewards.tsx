import React from 'react'
import { BuilderRewardDetails } from '@/app/collective-rewards/rewards'
import { RewardCard, type RewardType } from './components'
import { BuilderMetricCard } from './BuilderMetricCard'
import { ClaimRewardsButton } from './buttons/ClaimRewardsButton'
import { SeeRewardsHistoryButton } from './buttons/SeeRewardsHistoryButton'
import { AdjustBackersRewardsButton } from './buttons/AdjustBackersRewardsButton'
import { Header } from '@/components/TypographyNew'

interface BuilderRewardsProps extends BuilderRewardDetails {
  className?: string
  isMock?: boolean
}

// Configuration for each reward card with its specific props
const REWARD_CARDS_CONFIG: Array<{
  type: RewardType
  showButton?: boolean
  button?: React.ReactNode
  specialLayout?: boolean
}> = [
  {
    type: 'unclaimed',
    showButton: true,
    button: (
      <ClaimRewardsButton
        onClick={() => alert('Claim Rewards (placeholder - to be implemented in separate task)')}
      />
    ),
  },
  {
    type: 'estimatedThisCycle',
  },
  {
    type: 'lastCycle',
  },
  {
    type: 'allTimeRewards',
    showButton: true,
    button: (
      <SeeRewardsHistoryButton
        onClick={() => alert('See Rewards history (placeholder - to be implemented in separate task)')}
      />
    ),
  },
  {
    type: 'allTimeShare',
    specialLayout: true,
  },
]

export const BuilderRewards: React.FC<BuilderRewardsProps> = ({
  className = '',
  isMock = false,
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
        flex: '1 0 0',
        borderRadius: '4px',
        background: 'var(--color-v3-bg-accent-80)',
      }}
    >
      {/* Builder Rewards Text */}
      <div style={{ width: '528px' }}>
        <Header variant="e3" style={{ margin: 0, color: 'var(--color-v3-text-100)' }}>
          BUILDER REWARDS
        </Header>
      </div>

      {/* Metrics Container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
        }}
      >
        {REWARD_CARDS_CONFIG.map(config => (
          <BuilderMetricCard key={config.type} showButton={config.showButton} button={config.button}>
            {config.specialLayout ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <RewardCard
                  type={config.type}
                  isMock={isMock}
                  builder={builder}
                  tokens={{ rif, rbtc }}
                  gauge={gauge}
                  gauges={rest.gauges}
                  currency={rest.currency}
                />
              </div>
            ) : (
              <RewardCard
                type={config.type}
                isMock={isMock}
                builder={builder}
                tokens={{ rif, rbtc }}
                gauge={gauge}
                gauges={rest.gauges}
                currency={rest.currency}
              />
            )}
          </BuilderMetricCard>
        ))}
      </div>

      {/* Need to adjust backers' rewards? */}
      <AdjustBackersRewardsButton
        onClick={() => alert('Adjust backers rewards (placeholder - to be implemented in separate task)')}
      />
    </div>
  )
}
