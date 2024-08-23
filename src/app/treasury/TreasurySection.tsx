import { useTreasuryContext } from '@/app/treasury/TreasuryContext'
import { Paragraph } from '@/components/Typography'
import { MetricsCard } from '@/components/MetricsCard'
import { toFixed } from '@/lib/utils'

export const TreasurySection = () => {
  const { buckets } = useTreasuryContext()
  const [bucketOne, bucketTwo, bucketThree] = buckets
  return (
    <div>
      <Paragraph className="font-semibold text-[18px] mb-[17px]">Treasury</Paragraph>
      <div className="grid grid-cols-3 gap-[24px]">
        <MetricsCard
          title="Treasury 1 RIF Holdings"
          amount={toFixed(bucketOne.RIF.amount)}
          fiatAmount={`= USD ${bucketOne.RIF.fiatAmount}`}
        />
        <MetricsCard
          title="Treasury 2 RIF Holdings"
          amount={toFixed(bucketTwo.RIF.amount)}
          fiatAmount={`= USD ${bucketTwo.RIF.fiatAmount}`}
        />
        <MetricsCard
          title="Treasury 3 RIF Holdings"
          amount={toFixed(bucketThree.RIF.amount)}
          fiatAmount={`= USD ${bucketThree.RIF.fiatAmount}`}
        />
        <MetricsCard
          title="Treasury 1 RBTC Holdings"
          amount={toFixed(bucketOne.RBTC.amount)}
          fiatAmount={`= USD ${bucketOne.RBTC.fiatAmount}`}
        />
        <MetricsCard
          title="Treasury 2 RBTC Holdings"
          amount={toFixed(bucketTwo.RBTC.amount)}
          fiatAmount={`= USD ${bucketTwo.RBTC.fiatAmount}`}
        />
        <MetricsCard
          title="Treasury 3 RBTC Holdings"
          amount={toFixed(bucketThree.RBTC.amount)}
          fiatAmount={`= USD ${bucketThree.RBTC.fiatAmount}`}
        />
      </div>
    </div>
  )
}
