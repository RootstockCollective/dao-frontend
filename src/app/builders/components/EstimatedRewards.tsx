import { useHandleErrors } from '@/app/collective-rewards/utils'
import {
  formatSymbol,
  getFiatAmount as getFiatAmountFromRewards,
} from '@/app/collective-rewards/rewards/utils'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { MetricToken } from '@/app/components/Metric/types'
import { FiatTooltipLabel } from '@/app/components/Tooltip/FiatTooltipLabel/FiatTooltipLabel'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { Header, Paragraph } from '@/components/Typography'
import { RBTC, RIF, USDRIF } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import Big from 'big.js'

type USDWithTokensRewardsProps = {
  usd: Big
  rif: bigint
  rbtc: bigint
  usdrif: bigint
  rifPrice: number
  rbtcPrice: number
  usdrifPrice: number
}

const USDWithTokensRewards = ({
  usd,
  rif,
  rbtc,
  usdrif,
  rifPrice,
  rbtcPrice,
  usdrifPrice,
}: USDWithTokensRewardsProps) => {
  const tokens: Array<MetricToken> = [
    {
      symbol: RIF,
      value: formatSymbol(rif, RIF),
      fiatValue: formatCurrency(getFiatAmountFromRewards(rif, rifPrice)),
    },
    {
      symbol: RBTC,
      value: formatSymbol(rbtc, RBTC),
      fiatValue: formatCurrency(getFiatAmountFromRewards(rbtc, rbtcPrice)),
    },
    {
      symbol: USDRIF,
      value: formatSymbol(usdrif, USDRIF),
      fiatValue: formatCurrency(getFiatAmountFromRewards(usdrif, usdrifPrice)),
    },
  ]

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

  const rifPrice = prices[RIF]?.price ?? 0
  const rbtcPrice = prices[RBTC]?.price ?? 0
  const usdrifPrice = prices[USDRIF]?.price ?? 1

  const {
    rifBackerRewards,
    rbtcBackerRewards,
    usdBackerRewards,
    rifBuilderRewards,
    rbtcBuilderRewards,
    usdBuilderRewards,
  } = builderEstimatedRewards.reduce(
    (acc, builder) => {
      return {
        rifBackerRewards: acc.rifBackerRewards + builder.backerEstimatedRewards.rif.amount.value,
        rbtcBackerRewards: acc.rbtcBackerRewards + builder.backerEstimatedRewards.rbtc.amount.value,
        usdBackerRewards: acc.usdBackerRewards
          .add(
            getFiatAmountFromRewards(
              builder.backerEstimatedRewards.rif.amount.value,
              builder.backerEstimatedRewards.rif.amount.price,
            ),
          )
          .add(
            getFiatAmountFromRewards(
              builder.backerEstimatedRewards.rbtc.amount.value,
              builder.backerEstimatedRewards.rbtc.amount.price,
            ),
          ),
        rifBuilderRewards: acc.rifBuilderRewards + builder.builderEstimatedRewards.rif.amount.value,
        rbtcBuilderRewards: acc.rbtcBuilderRewards + builder.builderEstimatedRewards.rbtc.amount.value,
        usdBuilderRewards: acc.usdBuilderRewards
          .add(
            getFiatAmountFromRewards(
              builder.builderEstimatedRewards.rif.amount.value,
              builder.builderEstimatedRewards.rif.amount.price,
            ),
          )
          .add(
            getFiatAmountFromRewards(
              builder.builderEstimatedRewards.rbtc.amount.value,
              builder.builderEstimatedRewards.rbtc.amount.price,
            ),
          ),
      }
    },
    {
      rifBackerRewards: 0n,
      rbtcBackerRewards: 0n,
      usdBackerRewards: Big(0),
      rifBuilderRewards: 0n,
      rbtcBuilderRewards: 0n,
      usdBuilderRewards: Big(0),
    },
  )

  // FIXME: Mock USDRIF values with RIF values - replace with real API data when available
  const usdrifBackerRewards = rifBackerRewards
  const usdrifBuilderRewards = rifBuilderRewards
  return (
    <div className="flex flex-col gap-4 md:gap-0 md:flex-row basis-3/5">
      {builderEstimatedRewardsLoading ? (
        <LoadingSpinner size="medium" />
      ) : (
        <Metric
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
          <USDWithTokensRewards
            usd={usdBuilderRewards}
            rif={rifBuilderRewards}
            rbtc={rbtcBuilderRewards}
            usdrif={usdrifBuilderRewards}
            rifPrice={rifPrice}
            rbtcPrice={rbtcPrice}
            usdrifPrice={usdrifPrice}
          />
        </Metric>
      )}
      {builderEstimatedRewardsLoading ? (
        <LoadingSpinner size="medium" />
      ) : (
        <Metric
          className="md:justify-end"
          containerClassName="w-auto"
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
          <USDWithTokensRewards
            usd={usdBackerRewards}
            rif={rifBackerRewards}
            rbtc={rbtcBackerRewards}
            usdrif={usdrifBackerRewards}
            rifPrice={rifPrice}
            rbtcPrice={rbtcPrice}
            usdrifPrice={usdrifPrice}
          />
        </Metric>
      )}
    </div>
  )
}
