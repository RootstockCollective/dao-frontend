import { useGetGaugesArray, withBuilderButton } from '@/app/collective-rewards/user'
import { HeaderTitle } from '@/components/Typography'
import {
  TotalAllocationsMetrics,
  CycleMetrics,
  CycleContextProvider,
  TotalActiveBuildersMetrics,
  AllTimeRewardsMetrics,
} from '@/app/collective-rewards/metrics'
import { getAddress } from 'viem'
import { tokenContracts } from '@/lib/contracts'
import { getCoinbaseAddress } from '@/app/collective-rewards/utils'
import { PricesContextProvider } from '@/shared/context/PricesContext'

const HeaderWithBuilderButton = withBuilderButton(HeaderTitle)

export const Metrics = () => {
  const { data: activeGauges } = useGetGaugesArray('active')
  const gauges = activeGauges ?? []

  const tokens = {
    rif: {
      address: getAddress(tokenContracts.RIF),
      symbol: 'RIF',
    },
    rbtc: {
      address: getCoinbaseAddress(),
      symbol: 'RBTC',
    },
  }

  return (
    <div>
      <HeaderWithBuilderButton>Metrics</HeaderWithBuilderButton>
      <PricesContextProvider>
        <CycleContextProvider>
          <div className="flex gap-4 w-full">
            <div className="flex gap-4 h-min w-3/4">
              <CycleMetrics />
              <TotalActiveBuildersMetrics />
              <TotalAllocationsMetrics gauges={gauges} token={tokens.rif} />
            </div>
            <div className="w-1/4">
              <AllTimeRewardsMetrics gauges={gauges} tokens={tokens} />
            </div>
          </div>
        </CycleContextProvider>
      </PricesContextProvider>
    </div>
  )
}
