import { AvailableBackingMetric } from '../AvailableBackingMetric/AvailableBackingMetric'
import { TotalBackingMetric } from '../TotalBackingMetric/TotalBackingMetric'

interface BackingMetricsProps {
  availableForBacking: number
  availableBackingUSD: number
  totalBacking: number
  onStakeClick?: () => void
  onDistributeClick?: () => void
}

export const BackingMetrics = ({
  availableForBacking,
  availableBackingUSD,
  totalBacking,
  onStakeClick,
  onDistributeClick,
}: BackingMetricsProps) => {
  return (
    <div className="flex w-full items-start gap-14">
      <AvailableBackingMetric
        availableForBacking={availableForBacking}
        availableBackingUSD={availableBackingUSD}
        onStakeClick={onStakeClick}
        onDistributeClick={onDistributeClick}
      />
      <TotalBackingMetric totalBacking={totalBacking} />
    </div>
  )
}
