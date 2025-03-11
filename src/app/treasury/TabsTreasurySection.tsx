import { useState } from 'react'
import { UnderlineTabs } from '@/components/Tabs'
import { MetricsCard } from '@/components/MetricsCard'
import { Typography } from '@/components/Typography'
import { formatNumberWithCommas } from '@/lib/utils'
import Big from '@/lib/big'
import { useTabCards } from './hooks/useTabCards'

export function TabsTreasurySection() {
  const cards = useTabCards()
  const [activeTab, setActiveTab] = useState<keyof typeof cards>('Grants')

  return (
    <div>
      <UnderlineTabs
        className="py-4"
        tabs={Object.keys(cards).map(value => ({ value: value as keyof typeof cards }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="flex flex-row gap-4">
          {cards[activeTab].map(({ title, bucket, contract }) => {
            const isRif = title.toLowerCase().includes('rif')
            return (
              <MetricsCard
                className="max-w-[214px]"
                title={<Typography className="text-sm">{title}</Typography>}
                amount={
                  isRif
                    ? `${bucket?.amount ? formatNumberWithCommas(Big(bucket.amount).ceil()) : 0} RIF`
                    : `${bucket?.amount ? formatNumberWithCommas(Big(bucket.amount).toFixedNoTrailing(8)) : 0} RBTC`
                }
                fiatAmount={`= USD ${bucket?.fiatAmount ? bucket.fiatAmount : 0}`}
                contractAddress={contract}
                key={`${activeTab}-${title}`}
                borderless
              />
            )
          })}
          {/* {activeTab === 'General' && (
            <MetricsCard
              className="max-w-[447px]"
              title={<Typography className="text-sm">OTHERS</Typography>}
              borderless
            />
          )} */}
        </div>
      </UnderlineTabs>
    </div>
  )
}
