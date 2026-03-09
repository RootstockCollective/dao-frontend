import type { Meta, StoryObj } from '@storybook/nextjs'
import { CapitalAllocationDonutChart } from './CapitalAllocationDonutChart'
import type { CapitalAllocationDisplay } from '@/app/btc-vault/services/ui/types'

const meta = {
  title: 'BTC Vault/CapitalAllocationDonutChart',
  component: CapitalAllocationDonutChart,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div className="w-full max-w-md p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CapitalAllocationDonutChart>

export default meta

type Story = StoryObj<typeof meta>

const data50_25_25: CapitalAllocationDisplay = {
  categories: [
    { label: 'Deployed capital', amountFormatted: '0.52', percentFormatted: '50%', fiatAmountFormatted: '$26,000.00 USD' },
    { label: 'Liquidity reserve', amountFormatted: '0.26', percentFormatted: '25%', fiatAmountFormatted: '$13,000.00 USD' },
    { label: 'Unallocated capital', amountFormatted: '0.26', percentFormatted: '25%', fiatAmountFormatted: '$13,000.00 USD' },
  ],
  wallets: [],
}

const data80_10_10: CapitalAllocationDisplay = {
  categories: [
    { label: 'Deployed capital', amountFormatted: '0.80', percentFormatted: '80%', fiatAmountFormatted: '$40,000.00 USD' },
    { label: 'Liquidity reserve', amountFormatted: '0.10', percentFormatted: '10%', fiatAmountFormatted: '$5,000.00 USD' },
    { label: 'Unallocated capital', amountFormatted: '0.10', percentFormatted: '10%', fiatAmountFormatted: '$5,000.00 USD' },
  ],
  wallets: [],
}

const dataEqualThirds: CapitalAllocationDisplay = {
  categories: [
    { label: 'Deployed capital', amountFormatted: '0.34', percentFormatted: '33.33%', fiatAmountFormatted: '$17,000.00 USD' },
    { label: 'Liquidity reserve', amountFormatted: '0.33', percentFormatted: '33.33%', fiatAmountFormatted: '$16,500.00 USD' },
    { label: 'Unallocated capital', amountFormatted: '0.33', percentFormatted: '33.34%', fiatAmountFormatted: '$16,500.00 USD' },
  ],
  wallets: [],
}

export const Default: Story = {
  args: {
    data: data50_25_25,
    isAnimationActive: true,
  },
}

export const HeavyDeployed: Story = {
  args: {
    data: data80_10_10,
    isAnimationActive: true,
  },
}

export const EqualThirds: Story = {
  args: {
    data: dataEqualThirds,
    isAnimationActive: true,
  },
}
