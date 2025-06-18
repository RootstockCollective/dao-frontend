import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { PricesContext } from '@/shared/context/PricesContext'
import type { Meta, StoryObj } from '@storybook/react'
import { parseEther } from 'viem'
import { BackingCell } from './BackingCell'

// Simple mock data
const mockAllocations = {
  '0x1234567890123456789012345678901234567890': parseEther('30000'),
  '0x0987654321098765432109876543210987654321': parseEther('15000'),
}

const mockPrices = {
  RIF: { price: 0.0047, lastUpdated: '2024-01-01' },
  stRIF: { price: 0.0047, lastUpdated: '2024-01-01' },
}

const meta: Meta<typeof BackingCell> = {
  title: 'Koto/Builders/Table/Cell/BackingCell',
  component: BackingCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <PricesContext.Provider value={{ prices: mockPrices }}>
        <AllocationsContext.Provider
          value={
            {
              state: { allocations: mockAllocations },
              actions: {},
              initialState: { allocations: {}, backer: {} },
            } as any
          }
        >
          <Story />
        </AllocationsContext.Provider>
      </PricesContext.Provider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    builderAddress: '0x1234567890123456789012345678901234567890',
  },
}
