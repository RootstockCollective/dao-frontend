import { Metric } from '@/components/Metric/Metric'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'
import { CommonComponentProps } from '@/components/commonProps'
import { usePricesContext } from '@/shared/context/PricesContext'
import { TOKENS } from '@/lib/tokens'
import { useGetGaugesArray } from '@/app/hooks/useGetGaugesArray'
import { Address } from 'viem'
import { useGetGaugesNotifyReward } from '@/app/hooks/useGetGaugesNotifyReward'
import { useHandleErrors } from '@/app/utils'
import { formatCurrency } from '@/lib/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { MetricTitle } from '@/components/Metric'
import { Paragraph } from '@/components/TypographyNew'
import { Token } from '@/app/types'
import { formatSymbol, getFiatAmount } from '@/app/utils'

interface TokenRewardsProps {
  gauges: Address[]
  token: Token
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
    >
      <div className="flex flex-col gap-2">
        {Object.values(TOKENS).map(token => (
          <TokenRewards key={token.symbol} gauges={allGauges} token={token} />
        ))}
      </div>
    </Metric>
  )
}
