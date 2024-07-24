import { useTreasuryContext } from '@/app/treasury/TreasuryContext'
import { Paragraph } from '@/components/Typography'
import { MetricsCard } from '@/components/MetricsCard'

export const TreasurySection = () => {
  const { buckets } = useTreasuryContext()
  const [bucketOne, bucketTwo, bucketThree] = buckets
  return (
    <div>
      <Paragraph className="font-semibold text-[18px]">Treasury</Paragraph>
      <div className="grid grid-cols-3 gap-[24px]">
        <MetricsCard
          title="Treasury 1 RIF Holdings"
          amount={bucketOne.RIF.amount}
          fiatAmount={`= USD ${bucketOne.RIF.fiatAmount}`}
        />
        <MetricsCard
          title="Treasury 2 RIF Holdings"
          amount={bucketTwo.RIF.amount}
          fiatAmount={`= USD ${bucketTwo.RIF.fiatAmount}`}
        />
        <MetricsCard
          title="Treasury 3 RIF Holdings"
          amount={bucketThree.RIF.amount}
          fiatAmount={`= USD ${bucketThree.RIF.fiatAmount}`}
        />
        <MetricsCard
          title="Treasury 1 rBTC Holdings"
          amount={bucketOne.rBTC.amount}
          fiatAmount={`= USD ${bucketOne.rBTC.fiatAmount}`}
        />
        <MetricsCard
          title="Treasury 2 rBTC Holdings"
          amount={bucketTwo.rBTC.amount}
          fiatAmount={`= USD ${bucketTwo.rBTC.fiatAmount}`}
        />
        <MetricsCard
          title="Treasury 3 rBTC Holdings"
          amount={bucketThree.rBTC.amount}
          fiatAmount={`= USD ${bucketThree.rBTC.fiatAmount}`}
        />
      </div>
    </div>
  )
}
