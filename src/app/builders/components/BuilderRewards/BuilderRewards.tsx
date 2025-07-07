import React from 'react'
import { BuilderRewardDetails } from '@/app/collective-rewards/rewards'
import { RewardCard, type RewardType } from './components'
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
      className={`builder-rewards-container flex flex-col items-start gap-10 flex-1 min-w-0 w-[1144px] p-6 pb-10 rounded bg-[var(--color-v3-bg-accent-80)] ${className}`}
    >
      {/* Builder Rewards Text */}
      <div className="w-[528px]">
        <Header variant="e3" className="m-0 text-[var(--color-v3-text-100)]">
          BUILDER REWARDS
        </Header>
      </div>

      {/* Metrics Container */}
      <div className="flex items-start gap-2 self-stretch">
        {REWARD_CARDS_CONFIG.map(config => (
          <div
            key={config.type}
            className="flex flex-col items-start gap-2 self-stretch flex-1 min-w-0 pb-0.5 bg-[var(--color-v3-bg-accent-80)] rounded-lg"
          >
            <div className="flex-1 w-full">
              {config.specialLayout ? (
                <div className="flex flex-col items-center w-full">
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
            </div>
            {config.showButton && <span>{config.button}</span>}
          </div>
        ))}
      </div>

      {/* Need to adjust backers' rewards? */}
      <AdjustBackersRewardsButton
        onClick={() => alert('Adjust backers rewards (placeholder - to be implemented in separate task)')}
      />
    </div>
  )
}
