import { withBuilderButton } from '@/app/collective-rewards/user'
import { HeaderTitle } from '@/components/Typography'
import { CycleMetrics, WhitelistedBuildersLengthMetrics } from './components'

const HeaderWithBuilderButton = withBuilderButton(HeaderTitle)

export const MetricsSection = () => {
  return (
    <div>
      <HeaderWithBuilderButton>Metrics</HeaderWithBuilderButton>
      <div className="grid grid-cols-4 gap-[8px]">
        <CycleMetrics />
        <WhitelistedBuildersLengthMetrics />
      </div>
    </div>
  )
}
