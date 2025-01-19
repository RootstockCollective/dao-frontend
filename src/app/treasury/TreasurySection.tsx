import { useTreasuryContext } from '@/app/treasury/TreasuryContext'
import { HeaderTitle } from '@/components/Typography'
import { MetricsCard } from '@/components/MetricsCard'
import { formatNumberWithCommas } from '@/lib/utils'
import { treasuryContracts } from '@/lib/contracts'
import Big from '@/lib/big'

export const TreasurySection = () => {
  const { buckets } = useTreasuryContext()
  return (
    <div>
      <HeaderTitle className="mb-4">Treasury</HeaderTitle>
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-[24px]">
        {/* RIF Holdings */}
        {Object.values(treasuryContracts).map((contract, index) => (
          <MetricsCard
            key={`${contract.name}-RIF`}
            title={`${contract.name} RIF`}
            // Show the RIF amount, rounded up to the nearest whole number. If not available, show 0 RIF.
            amount={`${buckets[index]?.RIF?.amount ? formatNumberWithCommas(Big(buckets[index].RIF.amount).ceil().toString()) : 0} RIF`}
            // Display the fiat amount in USD, or show 0 if not available
            fiatAmount={`= USD ${buckets[index]?.RIF?.fiatAmount ? buckets[index].RIF.fiatAmount : 0}`}
            contractAddress={contract.address}
            data-testid={`${contract.name}-RIF`}
            borderless
          />
        ))}
        {/* RBTC Holdings */}
        {Object.values(treasuryContracts).map((contract, index) => (
          <MetricsCard
            key={`${contract.name}-RBTC`}
            title={`${contract.name} RBTC`}
            amount={`${Big(buckets[index]?.RBTC?.amount).toFixedNoTrailing(8)}`}
            fiatAmount={`= USD ${buckets[index]?.RBTC?.fiatAmount ? buckets[index].RBTC.fiatAmount : 0}`}
            data-testid={`${contract.name}-RBTC`}
            borderless
          />
        ))}
      </div>
    </div>
  )
}
