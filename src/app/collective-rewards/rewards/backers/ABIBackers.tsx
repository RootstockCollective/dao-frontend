import { FC } from 'react'
import {
  MetricsCardWithSpinner,
  MetricsCardTitle,
  RewardDetails,
  MetricsCardContent,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { ABIFormula, useGetRewardsAbi } from '@/app/collective-rewards/shared'
import { Address } from 'viem'

type ABIProps = {
  backer: Address
}

export const ABIBackers: FC<ABIProps> = ({ backer }) => {
  const { data: abiPct, isLoading, error } = useGetRewardsAbi(backer)
  useHandleErrors({ error, title: 'Error loading backers abi' })

  return (
    <MetricsCardWithSpinner isLoading={isLoading} borderless>
      <div className="flex flex-col gap-y-[10px]">
        <MetricsCardTitle
          title="Annual Backers Incentives %"
          data-testid="backerAbiPct"
          tooltip={{
            text: (
              <span className="font-rootstock-sans text-sm font-normal">
                Your Annual Backers Incentives (%) represents an estimate of the annualized percentage of
                rewards that you could receive based on your backing allocations.
                <br />
                <br />
                The calculation follows the formula:
                <span className="flex justify-center">
                  <ABIFormula />
                </span>
                <br />
                <br />
                This estimation is dynamic and may vary based on total rewards and user activity. This data is
                for informational purposes only.
              </span>
            ),
            popoverProps: {
              size: 'medium',
              position: 'left-bottom',
            },
          }}
        />
        <MetricsCardContent>{`${abiPct.toFixed(0)}%`}</MetricsCardContent>
      </div>
    </MetricsCardWithSpinner>
  )
}
