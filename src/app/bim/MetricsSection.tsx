import { Paragraph } from '@/components/Typography'
import { EpochMetrics } from '@/app/bim/metrics/EpochMetrics'
import { WhitelistedBuildersLengthMetrics } from '@/app/bim/metrics/WhitelistedBuildersLengthMetrics'

export const MetricsSection = () => {
  return (
    <div>
      <Paragraph className="font-semibold text-[18px] mb-[17px]">Metrics</Paragraph>
      <div className="grid grid-cols-4 gap-[8px]">
        <EpochMetrics />
        <WhitelistedBuildersLengthMetrics />
      </div>
    </div>
  )
}
