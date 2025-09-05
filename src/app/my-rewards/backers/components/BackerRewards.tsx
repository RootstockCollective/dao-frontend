import { BackerRewardsContextProvider } from '@/app/collective-rewards/rewards/backers/context/BackerRewardsContext'
import { TOKENS } from '@/lib/tokens'
import { FC } from 'react'
import { Address } from 'viem'
import { BackerRewardsMetrics } from './BackerRewardsMetrics'
import { BackerRewardsTableContainer } from './Table'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { Span } from '@/components/Typography'

const RewardDetailsItem = () => <div className="flex flex-col align-start gap-4 px-0 py-5">Builder A</div>

const MobileRewardsDetails = () => {
  return (
    <div className="block md:hidden">
      <Span variant="h4">REWARDS DETAILS</Span>
      <div className="flex flex-col align-start">
        <RewardDetailsItem />
        <RewardDetailsItem />
      </div>
    </div>
  )
}

export const BackerRewards: FC<{ backer: Address }> = ({ backer }) => {
  const isDesktop = useIsDesktop()
  return (
    <div className="flex flex-col w-full gap-10">
      <BackerRewardsContextProvider backer={backer} tokens={TOKENS}>
        <BackerRewardsMetrics backer={backer} />
        {/* FIXME: Temporary hiding of the table on mobile */}
        {isDesktop && (
          <div className="hidden md:block">
            <BackerRewardsTableContainer />
          </div>
        )}
        {!isDesktop && <MobileRewardsDetails />}
      </BackerRewardsContextProvider>
    </div>
  )
}
