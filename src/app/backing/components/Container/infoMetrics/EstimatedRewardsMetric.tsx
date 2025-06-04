import { Metric } from '@/app/backing/components/Metric/Metric'
import { MetricTitle } from '@/app/backing/components/Metric/MetricTitle'
import { useGetBuildersRewards } from '@/app/collective-rewards/rewards/builders/hooks/useGetBuildersRewards'
import { useEstimatedRewards } from '../hooks/useEstimatedRewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { COINBASE_ADDRESS } from '@/lib/constants'
import { tokenContracts } from '@/lib/contracts'
import { getAddress } from 'viem'
import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header } from '@/components/TypographyNew'
import { EstimatedRewardsPopover } from '@/app/backing/components/Container/infoMetrics/EstimatedRewardsPopover'

export const EstimatedRewardsMetric = () => {
  const tokens = {
    rif: {
      address: getAddress(tokenContracts.RIF),
      symbol: 'RIF',
    },
    rbtc: {
      address: COINBASE_ADDRESS,
      symbol: 'RBTC',
    },
  }

  const { data: rewardsData, isLoading, error } = useGetBuildersRewards(tokens)
  useHandleErrors({ error, title: 'Error loading builder rewards' })
  const { totalEstimatedRif, totalEstimatedRbtc, totalEstimatedUsd } = useEstimatedRewards(rewardsData)

  if (isLoading || rewardsData === undefined) return <LoadingSpinner size="small" />

  return (
    <Metric
      title={
        <MetricTitle
          title="Estimated Rewards"
          info={
            <EstimatedRewardsPopover
              className="p-6"
              totalEstimatedRbtc={totalEstimatedRbtc}
              totalEstimatedRif={totalEstimatedRif}
            >
              <KotoQuestionMarkIcon className="cursor-pointer" />
            </EstimatedRewardsPopover>
          }
        />
      }
      content={<Header variant="h1">{totalEstimatedUsd.toFixed(2)} USD</Header>}
    />
  )
}
