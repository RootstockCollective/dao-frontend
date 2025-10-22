import {
  formatSymbol,
  getFiatAmount,
  NotifyRewardEvent,
  useGetGaugesNotifyReward,
  UseGetGaugesNotifyRewardReturnType,
} from '@/app/collective-rewards/rewards'
import { useGetGaugesArray } from '@/app/collective-rewards/user'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { FiatTooltipLabel } from '@/app/components'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { MetricToken } from '@/app/components/Metric/types'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { MetricTitle } from '@/components/Metric'
import { Metric } from '@/components/Metric/Metric'
import { Header, Paragraph } from '@/components/Typography'
import { CommonComponentProps } from '@/components/commonProps'
import { REWARD_TOKEN_KEYS, REWARD_TOKENS, TOKENS } from '@/lib/tokens'
import { cn, formatCurrency, formatCurrencyWithLabel } from '@/lib/utils'
import { usePricesContext } from '@/shared/context/PricesContext'
import Big from 'big.js'
import { isAddressEqual } from 'viem'

interface TotalRewardsDistributedMetricProps extends CommonComponentProps {}

export const TotalRewardsDistributed = ({ className }: TotalRewardsDistributedMetricProps) => {
  const { data: gauges, isLoading: isLoadingGauges, error: errorGauges } = useGetGaugesArray()
  const {
    data: rewardsData,
    isLoading: isLoadingRewards,
    error: errorRewards,
  } = useGetGaugesNotifyReward({
    gauges,
    rewardTokens: REWARD_TOKEN_KEYS.map(tokenKey => TOKENS[tokenKey].address),
  })

  useHandleErrors({ error: errorGauges, title: 'Error loading gauges' })
  useHandleErrors({ error: errorRewards, title: 'Error loading rewards' })

  const totalRewardsPerToken: MetricToken[] = useConvertRewardLogData(rewardsData, {
    enabled: !!rewardsData,
  }).filter(({ value }) => value !== '0')

  if (isLoadingGauges || isLoadingRewards) {
    return <LoadingSpinner size="small" />
  }

  const combinedRewardsFiat = totalRewardsPerToken.reduce(
    (sum, { fiatValue }) => sum.add(Big(fiatValue)),
    Big(0),
  )

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
        <FiatTooltipLabel
          tooltip={{ side: 'top', text: <MetricTooltipContent tokens={totalRewardsPerToken} /> }}
        />
      </Header>
      <MetricBar segments={totalRewardsPerToken} />
    </Metric>
  )
}

function useConvertRewardLogData(
  rewardsData: UseGetGaugesNotifyRewardReturnType,
  options?: { enabled: boolean },
): MetricToken[] {
  const { prices } = usePricesContext()

  if (!options?.enabled) {
    return REWARD_TOKENS.map(({ symbol }) => ({
      symbol,
      value: '0',
      fiatValue: '0',
    }))
  }

  const allRewardEvents = Object.values(rewardsData).map<NotifyRewardEvent[]>(events => events)

  return REWARD_TOKENS.map<MetricToken>(({ address: tokenAddress, symbol }) => {
    const totalTokenRewards = allRewardEvents.reduce(
      (totalTokenReward, events) =>
        totalTokenReward +
        events.reduce(
          (combinedEventsReward, { args }) =>
            isAddressEqual(args.rewardToken_, tokenAddress)
              ? combinedEventsReward + args.backersAmount_ + args.builderAmount_
              : combinedEventsReward,
          0n,
        ),
      0n,
    )

    const fiatValue = formatCurrencyWithLabel(getFiatAmount(totalTokenRewards, prices[symbol]?.price ?? 0), {
      showCurrencyLabel: false,
      showCurrencySymbol: false,
    })
    const value = `${formatSymbol(totalTokenRewards, symbol)}`

    return {
      symbol,
      value,
      fiatValue,
    }
  })
}
