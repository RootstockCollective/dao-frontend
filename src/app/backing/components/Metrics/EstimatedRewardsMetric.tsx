import { useEstimatedRewards } from '../../hooks/useEstimatedRewards'
import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'
import { Header } from '@/components/TypographyNew'
import { formatCurrency } from '@/lib/utils'
import { RifRbtcPopover } from '@/app/backing/components/Popovers/RifRbtcPopover'
import { Metric, MetricTitle } from '@/components/Metric'
import { BuildersRewards } from '@/app/collective-rewards/rewards/builders/hooks/useGetBuildersRewards'

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
            <RifRbtcPopover
              className="p-6"
              totalEstimatedRbtc={totalEstimatedRbtc}
              totalEstimatedRif={totalEstimatedRif}
            >
              <KotoQuestionMarkIcon className="cursor-pointer" />
            </RifRbtcPopover>
          }
        />
      }
      content={<Header variant="h1">{formatCurrency(totalEstimatedUsd)} USD</Header>}
    />
  )
}
