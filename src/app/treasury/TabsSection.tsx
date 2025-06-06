import { useState } from 'react'
import { UnderlineTabs } from '@/components/Tabs'
import { MetricsCard } from '@/components/MetricsCard'
import { Typography } from '@/components/Typography'
import { formatCurrency, formatNumberWithCommas } from '@/lib/utils/utils'
import Big from '@/lib/big'
import { useTabCards } from './hooks/useTabCards'

/**
 * Displays a tabbed section with metrics for different treasury categories: Grant, Growth, General.
 * Each tab contains a set of metric cards displaying RIF and RBTC amounts,
 * as well as their equivalent fiat value in USD.
 */
export function TabsSection() {
  const cards = useTabCards()
  const [activeTab, setActiveTab] = useState<keyof typeof cards>('Grants')

  return (
    <UnderlineTabs
      layoutId="treasury-tab"
      tabs={Object.keys(cards).map(value => ({ value: value as keyof typeof cards }))}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="pt-4 flex flex-row gap-4">
        {cards[activeTab].map(({ title, bucket, contract }) => {
          const isRif = title.toLowerCase().includes('rif')
          return (
            <MetricsCard
              className="max-w-[214px] min-w-[120px]"
              title={<Typography className="text-sm font-bold">{title}</Typography>}
              amount={
                isRif
                  ? `${bucket?.amount ? formatNumberWithCommas(Big(bucket.amount).ceil()) : 0} RIF`
                  : `${bucket?.amount ? formatNumberWithCommas(Big(bucket.amount).toFixedNoTrailing(8)) : 0} RBTC`
              }
              fiatAmount={`= USD ${formatCurrency(bucket?.fiatAmount || 0)}`}
              contractAddress={contract}
              key={`${activeTab}-${title}`}
              borderless
            />
          )
        })}

        {/* A place for “Others” section (card) */}

        {/* {activeTab === 'General' && (
            <MetricsCard
              className="max-w-[447px]"
              title={<Typography className="text-sm">OTHERS</Typography>}
              borderless
            />
          )} */}
      </div>
    </UnderlineTabs>
  )
}
