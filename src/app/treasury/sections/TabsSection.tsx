import { useState } from 'react'
import { SolidTabs } from '@/components/Tabs'
import { BalanceInfo } from '@/components/BalanceInfo'
import { formatCurrency, formatNumberWithCommas } from '@/lib/utils'
import Big from '@/lib/big'
import { useTabCards } from '../hooks/useTabCards'
import { Paragraph } from '@/components/TypographyNew'

/**
 * Displays a tabbed section with metrics for different treasury categories: Grant, Growth, General.
 * Each tab contains a set of balance info cards displaying RIF and RBTC amounts,
 * as well as their equivalent fiat value in USD.
 */
export function TabsSection() {
  const cards = useTabCards()
  const [activeTab, setActiveTab] = useState<keyof typeof cards>('Grants')

  const handleTabChange = (value: string) => {
    setActiveTab(value as keyof typeof cards)
  }

  return (
    <SolidTabs
      tabs={Object.keys(cards).map(value => value as keyof typeof cards)}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="pt-4">
        {/* Optional description text */}
        <Paragraph variant="body-s" className="text-text-60 mb-10">
          Optional text explaining each tab... aliquam tristique, ligula et sodales commodo, erat ante
          molestie odio.
        </Paragraph>

        {/* Two column layout: Total and Rewards */}
        <div className="flex flex-row gap-8">
          {/* Total Column */}
          <div className="flex-1">
            <div className="text-lg font-bold mb-4">Total</div>
            <div className="flex flex-col gap-4">
              {cards[activeTab].map(({ title, bucket }) => {
                const isRif = title.toLowerCase().includes('rif')
                const symbol = isRif ? 'RIF' : 'rBTC'
                const amount = bucket?.amount
                  ? isRif
                    ? formatNumberWithCommas(Big(bucket.amount).ceil())
                    : formatNumberWithCommas(Big(bucket.amount).toFixedNoTrailing(8))
                  : '0'
                const fiatAmount = bucket?.fiatAmount
                  ? `= USD ${formatCurrency(bucket.fiatAmount)}`
                  : undefined

                return (
                  <BalanceInfo
                    key={`total-${title}`}
                    title={title}
                    amount={amount}
                    symbol={symbol}
                    fiatAmount={fiatAmount}
                    className="max-w-[214px]"
                  />
                )
              })}
            </div>
          </div>

          {/* Rewards Column */}
          <div className="flex-1">
            <div className="text-lg font-bold mb-4">Rewards</div>
            <div className="flex flex-col gap-4">
              {cards[activeTab].map(({ title, bucket }) => {
                const isRif = title.toLowerCase().includes('rif')
                const symbol = isRif ? 'RIF' : 'rBTC'
                const amount = bucket?.amount
                  ? isRif
                    ? formatNumberWithCommas(Big(bucket.amount).ceil())
                    : formatNumberWithCommas(Big(bucket.amount).toFixedNoTrailing(8))
                  : '0'
                const fiatAmount = bucket?.fiatAmount
                  ? `= USD ${formatCurrency(bucket.fiatAmount)}`
                  : undefined

                return (
                  <BalanceInfo
                    key={`rewards-${title}`}
                    title={title}
                    amount={amount}
                    symbol={symbol}
                    fiatAmount={fiatAmount}
                    className="max-w-[214px]"
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </SolidTabs>
  )
}
