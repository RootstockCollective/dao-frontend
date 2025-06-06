import {
  AllTimeRewardsMetrics,
  CycleContextProvider,
  CycleMetrics,
  TotalActiveBuildersMetrics,
  TotalAllocationsMetrics,
} from '@/app/collective-rewards/metrics'
import { useGetGaugesArray } from '@/app/collective-rewards/user'
import { HeaderTitle } from '@/components/Typography'
import { COINBASE_ADDRESS } from '@/lib/constants'
import { tokenContracts } from '@/lib/contracts'
import { getAddress } from 'viem'
import { ABIMetrics } from './components/ABIMetrics'

export const Metrics = () => {
  const { data: allGauges } = useGetGaugesArray()
  const gauges = allGauges ?? []

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

  return (
    <div>
      <HeaderTitle className="mb-6">Metrics</HeaderTitle>
      <CycleContextProvider>
        <div className="flex gap-4 w-full">
          <div className="flex gap-4 h-min w-3/5">
            <CycleMetrics />
            <TotalActiveBuildersMetrics />
            <TotalAllocationsMetrics gauges={gauges} token={tokens.rif} />
          </div>
          <div className="w-1/5">
            <AllTimeRewardsMetrics gauges={gauges} tokens={tokens} />
          </div>
          <div className="w-1/5">
            <ABIMetrics />
          </div>
        </div>
      </CycleContextProvider>
    </div>
  )
}
