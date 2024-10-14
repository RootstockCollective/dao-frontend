import { HeaderTitle } from '@/components/Typography'
import { EpochMetrics } from '@/app/bim/metrics/EpochMetrics'
import { WhitelistedBuildersLengthMetrics } from '@/app/bim/metrics/WhitelistedBuildersLengthMetrics'
import { WithBuilderButton } from '@/app/bim/WithBuilderButton'

const HeaderWithBuilderButton = WithBuilderButton(HeaderTitle)

export const MetricsSection = () => {
  return (
    <div>
      <HeaderWithBuilderButton>Metrics</HeaderWithBuilderButton>
      <div className="grid grid-cols-4 gap-[8px]">
        <EpochMetrics />
        <WhitelistedBuildersLengthMetrics />
      </div>
    </div>
  )
}
