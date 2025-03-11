import { FC } from 'react'
import {
  MetricsCardWithSpinner,
  MetricsCardTitle,
  MetricsCardContent,
  useGetBackerRBI,
  MetricsCardProps,
  Token,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Address } from 'viem'

// FIXME: change type to match the domain (backer not builder rewards)
type RBIProps = MetricsCardProps & {
  backer: Address
  tokens: Record<string, Token>
}

export const RBI: FC<RBIProps> = ({ backer, tokens, ...metricsCardProps }) => {
  const { data: rbiPct, isLoading, error } = useGetBackerRBI(backer, tokens)

  useHandleErrors({ error, title: 'Error loading RBI' })

  return (
    <MetricsCardWithSpinner isLoading={isLoading} borderless {...metricsCardProps}>
      <div className="flex flex-col gap-y-[10px]">
        <MetricsCardTitle
          className="text-wrap"
          title="Realized Backers Incentives %"
          data-testid="RBI"
          tooltip={{
            text: (
              <span className="font-rootstock-sans text-sm font-normal">
                Your Realized Backers Incentives (%) represents the actual percentage of rewards you have
                received so far based on your backing allocations.
                <br />
                <br />
                The calculation follows the formula:
                <span className="flex justify-center">
                  <span className="flex items-center space-x-1">
                    <span className="text-base">Total Staked Time *</span>
                    <span className="relative flex flex-col items-center justify-center space-y-1">
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="border-t border-white w-full" />
                      </span>
                      <span className="text-xs">
                        <span>Total Rewards Earned by Backer</span>
                      </span>
                      <span className="text-xs">
                        <span>Total stRIF Allocated by Backer</span>
                      </span>
                    </span>
                  </span>
                </span>
                <br />
                This data is for informational purposes only and does not guarantee future performance.
              </span>
            ),
            popoverProps: { size: 'medium', position: 'left-bottom' },
          }}
        />
        <MetricsCardContent>{`${rbiPct.toFixed(0)}%`}</MetricsCardContent>
      </div>
    </MetricsCardWithSpinner>
  )
}
