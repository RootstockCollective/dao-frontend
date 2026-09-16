import Big from 'big.js'

import {
  getTokenTotal,
  TotalRewardsDistributed as TotalRewardsDistributedByToken,
  useGetTotalRewardsDistributed,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { FiatTooltipLabel } from '@/app/components'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { MetricToken } from '@/app/components/Metric/types'
import { createMetricToken } from '@/app/components/Metric/utils'
import { CommonComponentProps } from '@/components/commonProps'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { MetricTitle } from '@/components/Metric'
import { Metric } from '@/components/Metric/Metric'
import { Header, Paragraph } from '@/components/Typography'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { cn, formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context/PricesContext'

interface TotalRewardsDistributedMetricProps extends CommonComponentProps {}

export const TotalRewardsDistributed = ({ className }: TotalRewardsDistributedMetricProps) => {
  const {
    data: totalsByToken,
    isLoading: isLoadingRewards,
    error: errorRewards,
  } = useGetTotalRewardsDistributed()

  useHandleErrors({ error: errorRewards, title: 'Error loading rewards' })

  const { rewardPerToken, combinedRewardsFiat } = useConvertRewardTotals(totalsByToken)

  if (isLoadingRewards) {
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
      className={cn(' gap-4', className)}
      containerClassName="gap-0 md:gap-2"
      contentClassName="flex flex-col gap-2"
    >
      <Header
        variant="h2"
        className="text-v3-text-100 overflow-hidden text-ellipsis leading-[125%] tracking-[0.03rem]"
      >
        {formatCurrency(combinedRewardsFiat, { showCurrencySymbol: false })}{' '}
        <FiatTooltipLabel tooltip={{ side: 'top', text: <MetricTooltipContent tokens={rewardPerToken} /> }} />
      </Header>
      <MetricBar segments={rewardPerToken} />
    </Metric>
  )
}

function useConvertRewardTotals(totals: TotalRewardsDistributedByToken): {
  rewardPerToken: MetricToken[]
  combinedRewardsFiat: Big
} {
  const { prices } = usePricesContext()

  return REWARD_TOKEN_KEYS.reduce<{ rewardPerToken: MetricToken[]; combinedRewardsFiat: Big }>(
    (acc, tokenKey) => {
      const { address: tokenAddress, symbol } = TOKENS[tokenKey]
      const price = prices[symbol]?.price ?? 0

      const metricToken = createMetricToken({
        symbol,
        value: getTokenTotal(totals, tokenAddress),
        price,
      })

      acc.rewardPerToken.push(metricToken)
      acc.combinedRewardsFiat = acc.combinedRewardsFiat.add(Big(metricToken.fiatValue))

      return acc
    },
    { rewardPerToken: [], combinedRewardsFiat: Big(0) },
  )
}
