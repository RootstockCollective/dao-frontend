import { useBuilderContext } from '@/app/collective-rewards/user'
import { isBuilderRewardable } from '@/app/collective-rewards/utils'
import { UpdateBackerRewardModal } from '@/app/my-rewards/builder/components/UpdateBackerRewardModal'
import { Collapsible } from '@/components/Collapsible'
import { ActionsContainer } from '@/components/containers/ActionsContainer'
import { Header } from '@/components/Typography'
import { cn } from '@/lib/utils'
import React, { useState } from 'react'
import { Address } from 'viem'
import { AdjustBackersRewardsButton } from './AdjustBackersRewardButton'
import { AllTimeShare } from './AllTimeShare'
import { EstimatedCycleRewards } from './EstimatedCycleRewards'
import { LastCycleRewards } from './LastCycleRewards'
import { TotalEarned } from './TotalEarned'
import { UnclaimedRewards } from './UnclaimedRewards'

const BuilderRewardsContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-2 self-stretch flex-1 min-w-0 pb-0.5 bg-v3-bg-accent-80 rounded-lg',
        className,
      )}
    >
      <div className="flex-1 w-full">{children}</div>
    </div>
  )
}

export const BuilderRewards = ({ address, gauge }: { address: Address; gauge: Address }) => {
  const [isUpdateBackersRewardsModalOpen, setIsUpdateBackersRewardsModalOpen] = useState(false)

  const { getBuilderByAddress } = useBuilderContext()

  return (
    <ActionsContainer
      title={
        <Header variant="h3" className="m-0 text-v3-text-100" data-testid="builder-rewards-header">
          BUILDER REWARDS
        </Header>
      }
      className="bg-v3-bg-accent-80 py-8 px-4 md:pb-10"
      containerClassName="gap-10"
    >
      <Collapsible.Root defaultOpen={false}>
        <div
          className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-2 self-stretch"
          data-testid="builder-rewards-cards-container"
        >
          <BuilderRewardsContainer>
            <UnclaimedRewards builder={address} gauge={gauge} />
          </BuilderRewardsContainer>

          <BuilderRewardsContainer>
            <EstimatedCycleRewards builder={address} gauge={gauge} />
          </BuilderRewardsContainer>

          <BuilderRewardsContainer className="hidden md:block">
            <LastCycleRewards gauge={gauge} />
          </BuilderRewardsContainer>

          <BuilderRewardsContainer className="hidden md:block">
            <TotalEarned gauge={gauge} />
          </BuilderRewardsContainer>

          <BuilderRewardsContainer>
            <AllTimeShare gauge={gauge} />
          </BuilderRewardsContainer>
        </div>

        <Collapsible.Content>
          <div className="flex flex-col sm:flex-row gap-6 mt-6 md:hidden">
            <BuilderRewardsContainer>
              <LastCycleRewards gauge={gauge} />
            </BuilderRewardsContainer>

            <BuilderRewardsContainer>
              <TotalEarned gauge={gauge} />
            </BuilderRewardsContainer>
          </div>
        </Collapsible.Content>

        <Collapsible.Toggle
          className="justify-center my-3"
          iconClassName="size-6 text-background-0 hover:text-background-20"
        />
      </Collapsible.Root>
      {isBuilderRewardable(getBuilderByAddress(address)?.stateFlags) && (
        <>
          <AdjustBackersRewardsButton
            onClick={() => setIsUpdateBackersRewardsModalOpen(true)}
            data-testid="adjust-backers-rewards-button"
          />

          <UpdateBackerRewardModal
            isOpen={isUpdateBackersRewardsModalOpen}
            onClose={() => setIsUpdateBackersRewardsModalOpen(false)}
            data-testid="update-backer-reward-modal"
          />
        </>
      )}
    </ActionsContainer>
  )
}
