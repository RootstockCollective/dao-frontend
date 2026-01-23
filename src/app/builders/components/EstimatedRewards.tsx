import { getCombinedFiatAmount, useHandleErrors } from '@/app/collective-rewards/utils'
import { MetricTooltipContent, MetricTooltipContentProps } from '@/app/components/Metric/MetricTooltipContent'
import { MetricToken } from '@/app/components/Metric/types'
import { createMetricToken } from '@/app/components/Metric/utils'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { FiatTooltipLabel } from '@/app/components/Tooltip/FiatTooltipLabel/FiatTooltipLabel'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { Header, Paragraph } from '@/components/Typography'
import { REWARD_TOKEN_KEYS, RewardTokenKey, TOKENS } from '@/lib/tokens'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import Big from 'big.js'
import { useMemo } from 'react'

type USDWithTokensRewardsProps = {
  usd: Big
  tokens: MetricTooltipContentProps['tokens']
}

const USDWithTokensRewards = ({ usd, tokens }: USDWithTokensRewardsProps) => {
  return (
    <div className="flex flex-row items-baseline gap-2 font-rootstock-sans">
      <Header className="text-xl md:text-[2rem]">{formatCurrency(usd)}</Header>
      <FiatTooltipLabel
        tooltip={{ text: <MetricTooltipContent tokens={tokens} />, side: 'top' }}
        className="text-sm md:text-lg"
      />
    </div>
  )
}

export const EstimatedRewards = () => {
  const { prices } = usePricesContext()
  const {
    data: builderEstimatedRewards,
    isLoading: builderEstimatedRewardsLoading,
    error: builderEstimatedRewardsError,
  } = useGetBuilderEstimatedRewards()

  useHandleErrors({ error: builderEstimatedRewardsError, title: 'Error loading CTA section' })

  const { backer, builder } = useMemo(
    () =>
      builderEstimatedRewards.reduce<{
        backer: Record<RewardTokenKey, bigint> & { fiatTotal: Big }
        builder: Record<RewardTokenKey, bigint> & { fiatTotal: Big }
      }>(
        (acc, builder) => {
          return {
            backer: {
              rif: acc.backer.rif + builder.backerEstimatedRewards.rif.amount.value,
              rbtc: acc.backer.rbtc + builder.backerEstimatedRewards.rbtc.amount.value,
              usdrif: acc.backer.usdrif + builder.backerEstimatedRewards.usdrif.amount.value,
              fiatTotal: acc.backer.fiatTotal.add(
                getCombinedFiatAmount([
                  builder.backerEstimatedRewards.rif.amount,
                  builder.backerEstimatedRewards.usdrif.amount,
                  builder.backerEstimatedRewards.rbtc.amount,
                ]),
              ),
            },
            builder: {
              rif: acc.builder.rif + builder.builderEstimatedRewards.rif.amount.value,
              rbtc: acc.builder.rbtc + builder.builderEstimatedRewards.rbtc.amount.value,
              usdrif: acc.builder.usdrif + builder.builderEstimatedRewards.usdrif.amount.value,
              fiatTotal: acc.builder.fiatTotal.add(
                getCombinedFiatAmount([
                  builder.builderEstimatedRewards.rif.amount,
                  builder.builderEstimatedRewards.usdrif.amount,
                  builder.builderEstimatedRewards.rbtc.amount,
                ]),
              ),
            },
          }
        },
        {
          backer: {
            rif: 0n,
            rbtc: 0n,
            usdrif: 0n,
            fiatTotal: Big(0),
          },
          builder: {
            rif: 0n,
            rbtc: 0n,
            usdrif: 0n,
            fiatTotal: Big(0),
          },
        },
      ),
    [builderEstimatedRewards],
  )

  const { builder: builderMetricTokens, backer: backerMetricTokens } = useMemo(
    () =>
      REWARD_TOKEN_KEYS.reduce<{
        builder: MetricToken[]
        backer: MetricToken[]
      }>(
        (acc, tokenKey) => {
          const { symbol } = TOKENS[tokenKey]
          const price = prices[symbol]?.price ?? 0

          return {
            builder: [
              ...acc.builder,
              createMetricToken({
                symbol,
                price,
                value: builder[tokenKey],
              }),
            ],
            backer: [
              ...acc.backer,
              createMetricToken({
                symbol,
                price,
                value: backer[tokenKey],
              }),
            ],
          }
        },
        {
          builder: [],
          backer: [],
        },
      ),
    [builder, backer, prices],
  )

  const { fiatTotal: builderFiatTotal } = builder
  const { fiatTotal: backerFiatTotal } = backer

  return (
    <div className="flex flex-col gap-4 md:gap-0 md:flex-row basis-3/5 max-md:w-full">
      {builderEstimatedRewardsLoading ? (
        <LoadingSpinner size="medium" />
      ) : (
        <Metric
          contentClassName="flex flex-col gap-2"
          title={
            <MetricTitle
              title="Estimated Rewards for Builders"
              infoIconProps={{
                tooltipClassName: 'max-w-sm text-sm',
              }}
              info={
                <Paragraph className="text-sm font-normal text-left">
                  The estimated rewards Builders will receive in the next Cycle.
                  <br />
                  <br />
                  The displayed information is dynamic and may vary based on total rewards and user activity.
                  This data is for informational purposes only.
                </Paragraph>
              }
            />
          }
        >
          <USDWithTokensRewards usd={builderFiatTotal} tokens={builderMetricTokens} />
          <MetricBar segments={builderMetricTokens} className="w-full md:max-w-[200px]" />
        </Metric>
      )}
      {builderEstimatedRewardsLoading ? (
        <LoadingSpinner size="medium" />
      ) : (
        <Metric
          className="md:justify-end"
          containerClassName="w-auto max-md:w-full"
          contentClassName="flex flex-col gap-2 items-start max-md:w-full"
          title={
            <MetricTitle
              title="Estimated Rewards for Backers"
              infoIconProps={{
                tooltipClassName: 'max-w-sm text-sm',
              }}
              info={
                <Paragraph className="text-sm font-normal text-left">
                  The estimated rewards Backers will receive in the next Cycle.
                  <br />
                  <br />
                  The displayed information is dynamic and may vary based on total rewards and user activity.
                  This data is for informational purposes only.
                </Paragraph>
              }
            />
          }
        >
          <USDWithTokensRewards usd={backerFiatTotal} tokens={backerMetricTokens} />
          <MetricBar segments={backerMetricTokens} className="w-full md:max-w-[200px]" />
        </Metric>
      )}
    </div>
  )
}
