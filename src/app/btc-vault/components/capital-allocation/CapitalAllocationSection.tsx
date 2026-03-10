'use client'

import { useState } from 'react'

import { SectionContainer } from '@/app/communities/components/SectionContainer'
import { BalanceInfo } from '@/components/BalanceInfo'
import { Switch, SwitchThumb } from '@/components/Switch'
import { TokenImage } from '@/components/TokenImage'
import { Label, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import { useCapitalAllocation } from '../../hooks/useCapitalAllocation'
import { CapitalAllocationDonutChart } from './CapitalAllocationDonutChart'
import { CAPITAL_ALLOCATION_TOOLTIP_MAP } from './CapitalAllocationSection.constants'
import { ContractAddressesSection } from './ContractAddressesSection'
import { FeesInfoSection } from './FeesInfoSection'
import { WalletBalancesTable } from './WalletBalancesTable'

export function CapitalAllocationSection() {
  const [isDetailed, setIsDetailed] = useState(false)
  const { data, isLoading, isError } = useCapitalAllocation()

  if (isError || (!isLoading && !data)) return null

  const toggleControl = (
    <div className="flex items-center gap-2 md:justify-end">
      <Switch checked={isDetailed} onCheckedChange={setIsDetailed} data-testid="detailed-view-toggle">
        <SwitchThumb />
      </Switch>
      <Label variant="body-s" className="text-100">
        Detailed view
      </Label>
    </div>
  )

  return (
    <section data-testid="capital-allocation-section" className="w-full">
      <SectionContainer
        title="CAPITAL ALLOCATION TRANSPARENCY"
        headerVariant="h3"
        rightContent={toggleControl}
      >
        {isDetailed ? (
          <div data-testid="capital-allocation-detailed" className="flex flex-col gap-6 xl:flex-row">
            <div className="w-full xl:max-w-[480px] xl:shrink-0">
              {isLoading ? (
                <div data-testid="detailed-loading" className="min-h-[200px]" />
              ) : (
                data && <CapitalAllocationDonutChart data={data} />
              )}
            </div>
            <div className="min-h-[200px] flex-1">
              {isLoading ? (
                <div data-testid="wallet-loading" className="min-h-[200px]" />
              ) : (
                data && <WalletBalancesTable wallets={data.wallets} />
              )}
            </div>
          </div>
        ) : (
          <div
            data-testid="capital-allocation-undetailed"
            className="flex flex-row flex-wrap gap-x-6 gap-y-6 md:gap-x-20"
          >
            {isLoading
              ? Array.from({ length: 3 }, (_, i) => (
                  <BalanceInfo
                    key={i}
                    className="w-[224px] min-w-[180px]"
                    amount="..."
                    data-testid={`metric-loading-${i}`}
                  />
                ))
              : data?.categories.map(cat => (
                  <BalanceInfo
                    key={cat.label}
                    className="w-[224px] min-w-[180px]"
                    title={cat.label}
                    amount={
                      <span className="flex flex-nowrap items-center gap-2">
                        <span className="shrink-0">{cat.amountFormatted}</span>
                        <span className="flex shrink-0 items-center gap-1">
                          <TokenImage symbol={RBTC} size={24} />
                          <Span variant="body-l" bold>
                            {RBTC}
                          </Span>
                        </span>
                        <span className="min-w-[1.25rem] shrink-0 text-center text-white/40">|</span>
                        <span className="shrink-0">{cat.percentFormatted}</span>
                      </span>
                    }
                    fiatAmount={cat.fiatAmountFormatted}
                    tooltipContent={CAPITAL_ALLOCATION_TOOLTIP_MAP[cat.label]}
                    data-testid={`metric-${cat.label.toLowerCase().replaceAll(/\s+/g, '-')}`}
                  />
                ))}
          </div>
        )}

        <ContractAddressesSection />
        <FeesInfoSection />
      </SectionContainer>
    </section>
  )
}
