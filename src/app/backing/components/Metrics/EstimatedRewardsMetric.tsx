import { useEstimatedRewards } from '../../hooks/useEstimatedRewards'
import { Header, Paragraph } from '@/components/TypographyNew'
import { formatCurrency } from '@/lib/utils'
import { RifRbtcTooltip } from '@/components/RifRbtcTooltip/RifRbtcTooltip'
import { Metric, MetricTitle } from '@/components/Metric'
import { BuildersRewards } from '@/app/collective-rewards/rewards/builders/hooks/useGetBuildersRewards'
import { DottedUnderlineLabel } from '@/components/DottedUnderlineLabel/DottedUnderlineLabel'

interface EstimatedRewardsMetricProps {
  rewardsData: BuildersRewards[]
}

export const EstimatedRewardsMetric = ({ rewardsData }: EstimatedRewardsMetricProps) => {
  const { totalEstimatedRif, totalEstimatedRbtc, totalEstimatedUsd } = useEstimatedRewards(rewardsData)

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
              Estimated rewards for the next Cycle available to Backers.
              <br />
              <br />
              The displayed information is dynamic and may vary based on total rewards and user activity. This
              data is for informational purposes only.
            </Paragraph>
          }
        />
      }
      content={
        <div className="flex flex-row items-baseline gap-2 font-rootstock-sans">
          <Header variant="h1">{formatCurrency(totalEstimatedUsd)}</Header>
          <RifRbtcTooltip rbtcValue={totalEstimatedRbtc} rifValue={totalEstimatedRif}>
            <DottedUnderlineLabel className="text-lg">USD</DottedUnderlineLabel>
          </RifRbtcTooltip>
        </div>
      }
    />
  )
}
