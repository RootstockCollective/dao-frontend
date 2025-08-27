import { getFiatAmount, useHandleErrors } from '@/app/collective-rewards/utils'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { DottedUnderlineLabel } from '@/components/DottedUnderlineLabel/DottedUnderlineLabel'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { RifRbtcTooltip } from '@/components/RifRbtcTooltip/RifRbtcTooltip'
import { Header, Paragraph, Span } from '@/components/Typography'
import { formatCurrency } from '@/lib/utils'
import Big from 'big.js'

const USDWithTokensRewards = ({ usd, rif, rbtc }: { usd: Big; rif: bigint; rbtc: bigint }) => (
  <div className="flex flex-row items-baseline gap-2 font-rootstock-sans">
    <Header className="text-xl md:text-[2rem]">{formatCurrency(usd)}</Header>
    <RifRbtcTooltip rbtcValue={rbtc} rifValue={rif}>
      <DottedUnderlineLabel>
        <Span className="text-sm md:text-lg">USD</Span>
      </DottedUnderlineLabel>
    </RifRbtcTooltip>
  </div>
)

export const EstimatedRewards = () => {
  const {
    data: builderEstimatedRewards,
    isLoading: builderEstimatedRewardsLoading,
    error: builderEstimatedRewardsError,
  } = useGetBuilderEstimatedRewards()

  useHandleErrors({ error: builderEstimatedRewardsError, title: 'Error loading CTA section' })

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
        rifBackerRewards: acc.rifBackerRewards + builder.backersEstimatedRewards.rif.amount.value,
        rbtcBackerRewards: acc.rbtcBackerRewards + builder.backersEstimatedRewards.rbtc.amount.value,
        usdBackerRewards: acc.usdBackerRewards
          .add(getFiatAmount(builder.backersEstimatedRewards.rif.amount))
          .add(getFiatAmount(builder.backersEstimatedRewards.rbtc.amount)),
        rifBuilderRewards: acc.rifBuilderRewards + builder.builderEstimatedRewards.rif.amount.value,
        rbtcBuilderRewards: acc.rbtcBuilderRewards + builder.builderEstimatedRewards.rbtc.amount.value,
        usdBuilderRewards: acc.usdBuilderRewards
          .add(getFiatAmount(builder.builderEstimatedRewards.rif.amount))
          .add(getFiatAmount(builder.builderEstimatedRewards.rbtc.amount)),
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
          <USDWithTokensRewards usd={usdBuilderRewards} rif={rifBuilderRewards} rbtc={rbtcBuilderRewards} />
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
          <USDWithTokensRewards usd={usdBackerRewards} rif={rifBackerRewards} rbtc={rbtcBackerRewards} />
        </Metric>
      )}
    </div>
  )
}
