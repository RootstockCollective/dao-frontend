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
        {Object.entries(buckets).map(([contract, bucket]) => (
          <MetricsCard
            key={`${contract}-RIF`}
            title={`${contract} RIF`}
            // Show the RIF amount, rounded up to the nearest whole number. If not available, show 0 RIF.
            amount={`${bucket?.RIF?.amount ? formatNumberWithCommas(Big(bucket.RIF.amount).ceil()) : 0} RIF`}
            // Display the fiat amount in USD, or show 0 if not available
            fiatAmount={`= USD ${bucket?.RIF?.fiatAmount ? bucket.RIF.fiatAmount : 0}`}
            contractAddress={treasuryContracts[contract as keyof typeof treasuryContracts].address}
            data-testid={`${contract}-RIF`}
            borderless
          />
        ))}
        {/* RBTC Holdings */}
        {Object.entries(buckets).map(([contract, bucket]) => (
          <MetricsCard
            key={`${contract}-RBTC`}
            title={`${contract} RBTC`}
            amount={`${formatNumberWithCommas(Big(bucket?.RBTC?.amount).toFixedNoTrailing(8))} RBTC`}
            fiatAmount={`= USD ${bucket?.RBTC?.fiatAmount ? bucket.RBTC.fiatAmount : 0}`}
            data-testid={`${contract}-RBTC`}
            borderless
          />
        ))}
      </div>
    </div>
  )
}
