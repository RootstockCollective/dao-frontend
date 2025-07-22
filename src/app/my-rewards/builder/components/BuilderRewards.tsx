import { Header } from '@/components/TypographyNew'
import React, { useState } from 'react'
import { Address } from 'viem'
import { AdjustBackersRewardsButton } from './AdjustBackersRewardButton'
import { AllTimeShare } from './AllTimeShare'
import { EstimatedCycleRewards } from './EstimatedCycleRewards'
import { LastCycleRewards } from './LastCycleRewards'
import { TotalEarned } from './TotalEarned'
import { UnclaimedRewards } from './UnclaimedRewards'
import { UpdateBackerRewardModal } from '@/app/my-rewards/builder/components/UpdateBackerRewardModal'
import { ActionsContainer } from '@/components/containers/ActionsContainer'

const BuilderRewardsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-start gap-2 self-stretch flex-1 min-w-0 pb-0.5 bg-v3-bg-accent-80 rounded-lg">
      <div className="flex-1 w-full">{children}</div>
    </div>
  )
}

export const BuilderRewards = ({ address, gauge }: { address: Address; gauge: Address }) => {
  const [isUpdateBackersRewardsModalOpen, setIsUpdateBackersRewardsModalOpen] = useState(false)

  return (
    <ActionsContainer
      title={
        <Header variant="e3" className="m-0 text-v3-text-100" data-testid="builder-rewards-header">
          BUILDER REWARDS
        </Header>
      }
      className="bg-v3-bg-accent-80 pb-10"
      containerClassName="gap-10"
    >
      <div className="flex items-start gap-2 self-stretch" data-testid="builder-rewards-cards-container">
        <BuilderRewardsContainer>
          <UnclaimedRewards builder={address} gauge={gauge} />
        </BuilderRewardsContainer>

        <BuilderRewardsContainer>
          <EstimatedCycleRewards builder={address} gauge={gauge} />
        </BuilderRewardsContainer>

        <BuilderRewardsContainer>
          <LastCycleRewards gauge={gauge} />
        </BuilderRewardsContainer>

        <BuilderRewardsContainer>
          <TotalEarned gauge={gauge} />
        </BuilderRewardsContainer>

        <BuilderRewardsContainer>
          <AllTimeShare gauge={gauge} />
        </BuilderRewardsContainer>
      </div>

      <AdjustBackersRewardsButton
        onClick={() => setIsUpdateBackersRewardsModalOpen(true)}
        data-testid="adjust-backers-rewards-button"
      />

      <UpdateBackerRewardModal
        isOpen={isUpdateBackersRewardsModalOpen}
        onClose={() => setIsUpdateBackersRewardsModalOpen(false)}
        data-testid="update-backer-reward-modal"
      />
    </ActionsContainer>
  )
}
