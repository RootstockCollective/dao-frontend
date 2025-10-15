'use client'
import { BalanceInfo } from '@/components/BalanceInfo'
import { SolidTabs } from '@/components/Tabs'
import { Label, Paragraph } from '@/components/Typography'
import { TokenSymbol } from '@/lib/tokens'
import { cn, formatCurrencyWithLabel } from '@/lib/utils'
import { useCallback, useState } from 'react'
import { AddressLink } from '../components/AddressLink'
import { useTreasuryTabs } from '../hooks/useTreasuryTabs'
import { TreasuryTabKey } from '../types'

/**
 * Displays a tabbed section with metrics for different treasury categories: Grant, Growth, General.
 * Each tab contains a set of balance info cards displaying RIF and RBTC amounts,
 * as well as their equivalent fiat value in USD.
 */
export function TabsSection() {
  const tabs = useTreasuryTabs()
  const [activeTab, setActiveTab] = useState<TreasuryTabKey>('Grants')

  const tabNames = Object.keys(tabs).map(value => value as TreasuryTabKey)
  const activeTabData = tabs[activeTab]
  const { description, categories } = activeTabData

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value as TreasuryTabKey)
    },
    [setActiveTab],
  )

  return (
    <SolidTabs tabs={tabNames} activeTab={activeTab} onTabChange={handleTabChange}>
      <div className="pt-4">
        <Paragraph variant="body" className="text-text-100 text-center mb-10">
          {description}
        </Paragraph>

        <div className="flex flex-col sm:flex-row gap-8">
          {Object.keys(categories).map(categoryName => {
            const { buckets, address } = categories[categoryName]
            const onlyOneCategory = Object.keys(categories).length === 1
            return (
              <div key={categoryName} className="flex-1">
                <Label className="text-bg-0">{categoryName}</Label>
                <div className="flex flex-col gap-6 mt-4">
                  <div
                    className={cn('flex flex-col gap-4', {
                      'flex-col sm:flex-row gap-6': onlyOneCategory,
                    })}
                  >
                    {buckets.map(({ title: symbol, bucket }) => (
                      <div className="flex-1" key={symbol}>
                        <BalanceInfo
                          amount={bucket?.formattedAmount}
                          symbol={symbol as TokenSymbol}
                          fiatAmount={formatCurrencyWithLabel(bucket?.fiatAmount ?? 0)}
                        />
                      </div>
                    ))}
                  </div>
                  <AddressLink
                    address={address}
                    className={cn({ 'justify-between sm:justify-center ': onlyOneCategory })}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SolidTabs>
  )
}
