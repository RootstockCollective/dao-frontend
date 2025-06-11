import { useGetBuildersRewards } from '@/app/collective-rewards/rewards/builders/hooks/useGetBuildersRewards'
import { useEstimatedRewards } from '../../hooks/useEstimatedRewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { getTokens } from '@/lib/tokens'
import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header } from '@/components/TypographyNew'
import { formatCurrency } from '@/lib/utils'
import { RifRbtcPopover } from '@/app/backing/components/Popovers/RifRbtcPopover'
import { Metric, MetricTitle } from '@/components/Metric'

export const EstimatedRewardsMetric = () => {
  const { data: rewardsData, isLoading, error } = useGetBuildersRewards(getTokens())
  useHandleErrors({ error, title: 'Error loading builder rewards' })
  const { totalEstimatedRif, totalEstimatedRbtc, totalEstimatedUsd } = useEstimatedRewards(rewardsData)

  if (isLoading || rewardsData === undefined) return <LoadingSpinner size="small" />

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
