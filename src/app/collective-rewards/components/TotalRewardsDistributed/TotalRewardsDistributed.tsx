import { formatMetrics, Token, useGetGaugesNotifyReward } from '@/app/collective-rewards/rewards'
import { useGetGaugesArray } from '@/app/collective-rewards/user'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { MetricTitle } from '@/components/Metric'
import { Metric } from '@/components/Metric/Metric'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'
import { Paragraph } from '@/components/Typography'
import { CommonComponentProps } from '@/components/commonProps'
import { TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'
import { Address } from 'viem'

interface TokenRewardsProps {
  gauges: Address[]
  token: Token
}

const TokenRewards = ({ gauges, token: { address, symbol } }: TokenRewardsProps) => {
  const { prices } = usePricesContext()
  const {
    data: rewardsData,
    isLoading,
    error,
  } = useGetGaugesNotifyReward({ gauges, rewardTokens: [address] })

  useHandleErrors({ error, title: `Error loading rewards for ${symbol}` })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-w-[80px]">
        <LoadingSpinner size="small" />
      </div>
    )
  }

  const totalRewards = Object.values(rewardsData).reduce(
    (acc, events) =>
      acc +
      events.reduce(
        (acc, { args: { backersAmount_, builderAmount_ } }) => acc + backersAmount_ + builderAmount_,
        0n,
      ),
    0n,
  )

  const price = prices[symbol]?.price ?? 0
  const { amount, fiatAmount } = formatMetrics(totalRewards, price, symbol)

  return <TokenAmountDisplay amount={amount} tokenSymbol={symbol} amountInCurrency={fiatAmount} isFlexEnd />
}

interface TotalRewardsDistributedMetricProps extends CommonComponentProps {}

export const TotalRewardsDistributed = ({ className }: TotalRewardsDistributedMetricProps) => {
  const { data: allGauges, isLoading, error } = useGetGaugesArray()

  useHandleErrors({ error, title: 'Error loading gauges' })

  if (isLoading) {
    return <LoadingSpinner size="small" />
  }

  return (
    <Metric
      title={
        <MetricTitle
          title="Total Rewards Distributed"
          info={
            <Paragraph className="text-[14px] font-normal text-left">
              Total rewards distributed to Builders and Backers
            </Paragraph>
          }
        />
      }
      className={className}
      containerClassName="gap-0 md:gap-2"
    >
      <div className="flex flex-row md:flex-col justify-between w-full gap-2">
        {Object.values(TOKENS).map(token => (
          <TokenRewards key={token.symbol} gauges={allGauges} token={token} />
        ))}
      </div>
    </Metric>
  )
}
