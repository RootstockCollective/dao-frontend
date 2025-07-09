import { Header } from '@/components/TypographyNew'

import { BackersEstimatedRewards } from './BackersEstimatedRewards'
import { ABI } from './ABI'

export const BackerRewardsNotConnected = () => {
  return (
    <div className="flex flex-col w-full gap-10" data-testid="backer-rewards">
      <div className="flex justify-between">
        <Header
          variant="e3"
          className="m-0 text-v3-text-100"
          data-testid="backer-rewards-header-not-connected"
        >
          TOTAL BACKER REWARDS
        </Header>
      </div>

      <div className="flex items-start" data-testid="backer-rewards-cards-container-not-connected">
        <BackersEstimatedRewards />
        <div className="ml-[10rem]">
          <ABI />
        </div>
      </div>
    </div>
  )
}
