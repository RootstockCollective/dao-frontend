import { Metric } from '@/components/Metric/Metric'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'
import { CommonComponentProps } from '@/components/commonProps'
import { usePricesContext } from '@/shared/context/PricesContext'
import { getTokens, TokenInfo } from '@/lib/tokens'
import { useGetGaugesArray } from '@/app/collective-rewards/user'
import { Address } from 'viem'
import { formatSymbol, getFiatAmount, useGetGaugesNotifyReward } from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { formatCurrency } from '@/lib/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { MetricTitle } from '@/components/Metric'
import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'
import { Popover } from '@/components/Popover'

interface TokenRewardsProps {
  gauges: Address[]
  token: TokenInfo
}

const TokenRewards = ({ gauges, token: { address, symbol } }: TokenRewardsProps) => {
  const { prices } = usePricesContext()
  const { data: rewardsData, isLoading, error } = useGetGaugesNotifyReward(gauges, address)

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
  const amount = formatSymbol(totalRewards, symbol)
  const fiatAmount = formatCurrency(getFiatAmount(totalRewards, price), {
    currency: 'USD',
    showCurrency: true,
  })

  return <TokenAmountDisplay amount={amount} tokenSymbol={symbol} amountInCurrency={fiatAmount} />
}

interface TotalRewardsDistributedMetricProps extends CommonComponentProps {}

export const TotalRewardsDistributed = ({ className }: TotalRewardsDistributedMetricProps) => {
  const { data: allGauges } = useGetGaugesArray()

  const tokens = getTokens()

  return (
    <Metric
      title={
        <MetricTitle
          title="Total Rewards Distributed"
          info="Total rewards distributed to Builders and Backers"
          infoButtonProps={{
            contentSubContainerClassName: 'p-1',
          }}
        />
      }
      className={className}
    >
      <div className="flex flex-row gap-2">
        {Object.values(tokens).map(token => (
          <TokenRewards key={token.symbol} gauges={allGauges} token={token} />
        ))}
      </div>
    </Metric>
  )
}
