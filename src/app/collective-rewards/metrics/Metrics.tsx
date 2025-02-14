import { BecomeABuilderButton, useGetGaugesArray } from '@/app/collective-rewards/user'
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
import { ABIMetrics } from './components/ABIMetrics'
import { useAccount } from 'wagmi'

export const Metrics = () => {
  const { address } = useAccount()
  const { data: allGauges } = useGetGaugesArray()
  const gauges = allGauges ?? []

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
      <div className="flex justify-between items-center self-stretch mb-6">
        <HeaderTitle>Metrics</HeaderTitle>
        <BecomeABuilderButton address={address!} />
      </div>
      <PricesContextProvider>
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
      </PricesContextProvider>
    </div>
  )
}
