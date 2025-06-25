import { useEstimatedRewards } from '../../hooks/useEstimatedRewards'
import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'
import { Header } from '@/components/TypographyNew'
import { formatCurrency } from '@/lib/utils'
import { RifRbtcTooltip } from '@/components/RifRbtcTooltip/RifRbtcTooltip'
import { Metric, MetricTitle } from '@/components/Metric'
import { BuildersRewards } from '@/app/collective-rewards/rewards/builders/hooks/useGetBuildersRewards'
import { DottedUnderlineLabel } from '@/components/DottedUnderlineLabel/DottedUnderlineLabel'
import { EstimatedRewardsPopover } from '@/app/backing/components/Popovers/EstimatedRewardsPopover'

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
          info={
            <EstimatedRewardsPopover>
              <KotoQuestionMarkIcon className="cursor-pointer" />
            </EstimatedRewardsPopover>
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
