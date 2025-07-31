import { Header, Paragraph } from '@/components/TypographyNew'
import { formatCurrency } from '@/lib/utils'
import { RifRbtcTooltip } from '@/components/RifRbtcTooltip/RifRbtcTooltip'
import { Metric, MetricTitle } from '@/components/Metric'
import { DottedUnderlineLabel } from '@/components/DottedUnderlineLabel/DottedUnderlineLabel'
import { useGetBuilderEstimatedRewards } from '@/app/hooks/useGetBuilderEstimatedRewards'
import { getFiatAmount, useHandleErrors } from '@/app/utils'
import Big from '@/lib/big'
import { LoadingSpinner } from '@/components/LoadingSpinner/LoadingSpinner'

export const EstimatedRewardsMetric = () => {
  const { data: estimatedRewards, isLoading, error } = useGetBuilderEstimatedRewards()
  useHandleErrors({ error, title: 'Error fetching estimated rewards' })

  const { totalEstimatedRif, totalEstimatedRbtc, totalEstimatedUsd } = estimatedRewards.reduce(
    (acc: { totalEstimatedRif: bigint; totalEstimatedRbtc: bigint; totalEstimatedUsd: Big }, builder) => {
      return {
        totalEstimatedRif: acc.totalEstimatedRif + builder.backerEstimatedRewards.rif.amount.value,
        totalEstimatedRbtc: acc.totalEstimatedRbtc + builder.backerEstimatedRewards.rbtc.amount.value,
        totalEstimatedUsd: acc.totalEstimatedUsd
          .add(
            getFiatAmount(
              builder.backerEstimatedRewards.rif.amount.value,
              builder.backerEstimatedRewards.rif.amount.price,
            ),
          )
          .add(
            getFiatAmount(
              builder.backerEstimatedRewards.rbtc.amount.value,
              builder.backerEstimatedRewards.rbtc.amount.price,
            ),
          ),
      }
    },
    { totalEstimatedRif: 0n, totalEstimatedRbtc: 0n, totalEstimatedUsd: Big(0) },
  )

  return (
    <Metric
      title={
        <MetricTitle
          title="Estimated Rewards"
          infoIconProps={{
            tooltipClassName: 'max-w-sm text-sm',
          }}
          info={
            <Paragraph className="text-[14px] font-normal text-left">
              The estimated rewards Backers will receive in the next Cycle.
              <br />
              <br />
              The displayed information is dynamic and may vary based on total rewards and user activity. This
              data is for informational purposes only.
            </Paragraph>
          }
        />
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-row items-baseline gap-2 font-rootstock-sans">
          <Header variant="h1">{formatCurrency(totalEstimatedUsd)}</Header>
          <RifRbtcTooltip rbtcValue={totalEstimatedRbtc} rifValue={totalEstimatedRif}>
            <DottedUnderlineLabel className="text-lg">USD</DottedUnderlineLabel>
          </RifRbtcTooltip>
        </div>
      )}
    </Metric>
  )
}
