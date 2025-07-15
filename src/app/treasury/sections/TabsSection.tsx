'use client'
import { BalanceInfo } from '@/components/BalanceInfo'
import { SolidTabs } from '@/components/Tabs'
import { Label, Paragraph } from '@/components/TypographyNew'
import Big from '@/lib/big'
import { cn, formatCurrency, formatNumberWithCommas } from '@/lib/utils'
import { useState } from 'react'
import { AddressLink } from '../components/AddressLink'
import { useTabCards } from '../hooks/useTabCards'

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
  const tabs = Object.keys(cards).map(value => value as keyof typeof cards)
  const activeTabData = cards[activeTab]

  return (
    <SolidTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange}>
      <div className="pt-4">
        <Paragraph variant="body" className="text-text-100 text-center mb-10">
          Optional text explaining each tab... aliquam tristique, ligula et sodales commodo, erat ante
          molestie odio.
        </Paragraph>

        <div className="flex flex-row gap-8">
          {Object.keys(activeTabData).map(key => {
            const { assets, address } = activeTabData[key]
            const onlyOneSection = Object.keys(activeTabData).length === 1
            return (
              <div key={key} className="flex-1">
                <Label className="text-bg-0">{key}</Label>
                <div className="flex flex-col gap-6 mt-4">
                  <div
                    className={cn('flex flex-col gap-4', {
                      'flex-row gap-6': onlyOneSection,
                    })}
                  >
                    {assets.map(({ title, bucket }) => {
                      const isRif = title.toLowerCase().includes('rif')
                      const symbol = isRif ? 'RIF' : 'rBTC'
                      const amount = bucket?.amount
                        ? isRif
                          ? formatNumberWithCommas(Big(bucket.amount).ceil())
                          : formatNumberWithCommas(Big(bucket.amount).toFixedNoTrailing(8))
                        : '0'
                      const fiatAmount = bucket?.fiatAmount
                        ? `${formatCurrency(bucket.fiatAmount)}`
                        : undefined
                      return (
                        <div className="flex-1">
                          <BalanceInfo key={title} amount={amount} symbol={symbol} fiatAmount={fiatAmount} />
                        </div>
                      )
                    })}
                  </div>
                  <AddressLink address={address} className={cn({ 'justify-center': onlyOneSection })} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SolidTabs>
  )
}
