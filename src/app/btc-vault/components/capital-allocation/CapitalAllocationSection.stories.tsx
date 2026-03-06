import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { BalanceInfo } from '@/components/BalanceInfo'
import { Switch, SwitchThumb } from '@/components/Switch'
import { TokenImage } from '@/components/TokenImage'
import { Label, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { SectionContainer } from '@/app/communities/components/SectionContainer'
import type { CapitalAllocationDisplay, CapitalCategoryDisplay } from '../../services/ui/types'

import { CapitalAllocationDonutChart } from './CapitalAllocationDonutChart'
import { CAPITAL_ALLOCATION_TOOLTIP_MAP } from './CapitalAllocationSection.constants'

interface StoryProps {
  categories: CapitalCategoryDisplay[]
  isLoading?: boolean
}

function CapitalAllocationStory({ categories, isLoading = false }: StoryProps) {
  const [isDetailed, setIsDetailed] = useState(false)

  const displayData: CapitalAllocationDisplay = { categories, wallets: [] }

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
      <SectionContainer title="CAPITAL ALLOCATION TRANSPARENCY" headerVariant="h3" rightContent={toggleControl}>
        {isDetailed ? (
          <div data-testid="capital-allocation-detailed" className="flex flex-col gap-6 md:flex-row">
            <div className="w-full md:w-auto md:max-w-[480px] md:shrink-0">
              {isLoading ? (
                <div data-testid="detailed-loading" className="min-h-[200px]" />
              ) : (
                <CapitalAllocationDonutChart data={displayData} />
              )}
            </div>
            <div data-testid="capital-allocation-wallet-placeholder" className="min-h-[200px] flex-1" />
          </div>
        ) : (
          <div
            data-testid="capital-allocation-undetailed"
            className="flex flex-row flex-wrap gap-x-6 gap-y-6 md:gap-x-20"
          >
            {isLoading
              ? Array.from({ length: 3 }, (_, i) => (
                  <BalanceInfo key={i} className="w-[214px] min-w-[180px]" amount="..." />
                ))
              : categories.map(cat => (
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
                  />
                ))}
          </div>
        )}
      </SectionContainer>
    </section>
  )
}

const meta = {
  title: 'BTC Vault/CapitalAllocationSection',
  component: CapitalAllocationStory,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <div className="w-full p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CapitalAllocationStory>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    categories: [
      {
        label: 'Deployed capital',
        amountFormatted: '0.52',
        percentFormatted: '50%',
        fiatAmountFormatted: '$26,000.00 USD',
      },
      {
        label: 'Liquidity reserve',
        amountFormatted: '0.26',
        percentFormatted: '25%',
        fiatAmountFormatted: '$13,000.00 USD',
      },
      {
        label: 'Unallocated capital',
        amountFormatted: '0.26',
        percentFormatted: '25%',
        fiatAmountFormatted: '$13,000.00 USD',
      },
    ],
  },
}

export const EqualSplit: Story = {
  args: {
    categories: [
      {
        label: 'Deployed capital',
        amountFormatted: '0.34',
        percentFormatted: '33.33%',
        fiatAmountFormatted: '$17,000.00 USD',
      },
      {
        label: 'Liquidity reserve',
        amountFormatted: '0.34',
        percentFormatted: '33.33%',
        fiatAmountFormatted: '$17,000.00 USD',
      },
      {
        label: 'Unallocated capital',
        amountFormatted: '0.34',
        percentFormatted: '33.33%',
        fiatAmountFormatted: '$17,000.00 USD',
      },
    ],
  },
}

export const Loading: Story = {
  args: {
    categories: [],
    isLoading: true,
  },
}
