import {
  MetricsCardContent,
  MetricsCardProps,
  MetricsCardTitle,
  MetricsCardWithSpinner,
} from '@/app/collective-rewards/rewards'
import { ABIFormula, useGetBackerABI } from '@/app/collective-rewards/shared'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { FC } from 'react'
import { Address } from 'viem'

type ABIProps = MetricsCardProps & {
  backer: Address
}

export const ABIBackers: FC<ABIProps> = ({ backer, ...metricsCardProps }) => {
  const { data: abiPct, isLoading, error } = useGetBackerABI(backer)
  useHandleErrors({ error, title: 'Error loading backers abi' })

  return (
    <MetricsCardWithSpinner isLoading={isLoading} borderless {...metricsCardProps} dataTestId="backerAbi">
      <div className="flex flex-col gap-y-[10px]">
        <MetricsCardTitle
          className="text-wrap"
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
