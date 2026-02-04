import { useHandleErrors } from '@/app/collective-rewards/utils'
import { AnnualBackersIncentives } from '@/app/shared/components/AnnualBackersIncentives'
import { TokenAmount } from '@/components/TokenAmount'
import { Header } from '@/components/Typography'
import { RBTC, RIF } from '@/lib/constants'
import { RewardCard } from '../../components/RewardCard'
import { useBackersEstimatedRewards } from '../hooks/useBackersEstimatedRewards'

export const BackerRewardsNotConnected = () => {
  const { rif: rifData, rbtc: rbtcData } = useBackersEstimatedRewards()

  useHandleErrors({
    error: rifData.error ?? rbtcData.error,
    title: 'Error loading backers estimated rewards',
  })

  return (
    <div className="flex flex-col w-full gap-8 md:gap-10" data-testid="backer-rewards-not-connected">
      <div className="flex justify-between">
        <Header
          variant="h3"
          className="m-0 text-v3-text-100"
          data-testid="backer-rewards-header-not-connected"
        >
          TOTAL BACKER REWARDS
        </Header>
      </div>

      <div
        className="flex flex-col md:flex-row items-start gap-10"
        data-testid="backer-rewards-cards-container-not-connected"
      >
        <AnnualBackersIncentives className="basis-3/4" />
        <div className="sm:basis-1/4 w-full">
          <RewardCard
            isLoading={rifData.isLoading || rbtcData.isLoading}
            title="Estimated this cycle"
            info={
              <span className="text-[14px] font-normal text-left">
                Estimated rewards for the next Cycle available to Backers.
                <br />
                <br />
                The displayed information is dynamic and may vary based on total rewards and user activity.
                This data is for informational purposes only.
              </span>
            }
            className="flex-row sm:flex-col justify-between w-full sm:w-auto"
          >
            <TokenAmount amount={rifData.amount} tokenSymbol={RIF} amountInFiat={rifData.fiatAmount} />
            <TokenAmount amount={rbtcData.amount} tokenSymbol={RBTC} amountInFiat={rbtcData.fiatAmount} />
          </RewardCard>
        </div>
      </div>
    </div>
  )
}
