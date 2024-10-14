import { useTreasuryContext } from '@/app/treasury/TreasuryContext'
import { HeaderTitle } from '@/components/Typography'
import { MetricsCard } from '@/components/MetricsCard'
import { toFixed } from '@/lib/utils'
import { treasuryContracts } from '@/lib/contracts'

export const TreasurySection = () => {
  const { buckets } = useTreasuryContext()
  return (
    <div>
      <HeaderTitle className="mb-4">Treasury</HeaderTitle>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[24px]">
        {/* RIF Holdings */}
        {treasuryContracts.map((contract, index) => (
          <MetricsCard
            key={`${contract.name}-RIF`}
            title={`${contract.name} RIF Holdings`}
            amount={`${toFixed(buckets[index].RIF.amount)} RIF`}
            fiatAmount={`= USD ${buckets[index].RIF.fiatAmount}`}
            contractAddress={contract.address}
            data-testid={`${contract.name}-RIF`}
            borderless
          />
        ))}
        {/* RBTC Holdings */}
        {treasuryContracts.map((contract, index) => (
          <MetricsCard
            key={`${contract.name}-RBTC`}
            title={`${contract.name} RBTC Holdings`}
            amount={toFixed(buckets[index].RBTC.amount)}
            fiatAmount={`= USD ${buckets[index].RBTC.fiatAmount}`}
            data-testid={`${contract.name}-RBTC`}
            borderless
          />
        ))}
      </div>
    </div>
  )
}
