import { useTreasuryContext } from '@/app/treasury/TreasuryContext'
import { Paragraph } from '@/components/Typography'
import { MetricsCard } from '@/components/MetricsCard'

export const TreasurySection = () => {
  const { buckets } = useTreasuryContext()
  const [bucketOne] = buckets
  return (
    <div>
      <Paragraph className="font-semibold text-[18px]">Treasury</Paragraph>
      <div className="grid grid-cols-3 gap-[24px]">
        <MetricsCard
          title="Treasury 1 RIF Holdings"
          amount={bucketOne.RIF.amount}
          fiatAmount={`= USD ${bucketOne.RIF.fiatAmount}`}
        />
        <MetricsCard title="Treasury 2 RIF Holdings" amount="-" fiatAmount="-" />
        <MetricsCard title="Treasury 3 RIF Holdings" amount="-" fiatAmount="-" />
        <MetricsCard
          title="Treasury 1 rBTC Holdings"
          amount={bucketOne.rBTC.amount}
          fiatAmount={`= USD ${bucketOne.rBTC.fiatAmount}`}
        />
        <MetricsCard title="Treasury 2 rBTC Holdings" amount="-" fiatAmount="-" />
        <MetricsCard title="Treasury 3 rBTC Holdings" amount="-" fiatAmount="-" />
      </div>
    </div>
  )
}
