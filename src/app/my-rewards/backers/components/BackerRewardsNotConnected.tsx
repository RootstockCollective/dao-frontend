import { AnnualBackersIncentives } from '@/app/components'
import { Header } from '@/components/TypographyNew'
import { BackersEstimatedRewards } from './BackersEstimatedRewards'

export const BackerRewardsNotConnected = () => {
  return (
    <div className="flex flex-col w-full gap-10" data-testid="backer-rewards-not-connected">
      <div className="flex justify-between">
        <Header
          variant="e3"
          className="m-0 text-v3-text-100"
          data-testid="backer-rewards-header-not-connected"
        >
          TOTAL BACKER REWARDS
        </Header>
      </div>

      <div className="flex items-start gap-10" data-testid="backer-rewards-cards-container-not-connected">
        <AnnualBackersIncentives className="basis-3/4" />
        <div className="basis-1/4">
          <BackersEstimatedRewards />
        </div>
      </div>
    </div>
  )
}
