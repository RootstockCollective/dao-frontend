import type { Meta, StoryObj } from '@storybook/react'
import { BuilderRewards } from './BuilderRewards'
import { ContextProviders } from '@/app/providers/ContextProviders'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'

const meta: Meta<typeof BuilderRewards> = {
  title: 'Builders/BuilderRewards',
  component: BuilderRewards,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#101010' },
        { name: 'light', value: '#fff' },
      ],
    },
    docs: {
      description: {
        component:
          'This story demonstrates the full BuilderRewards layout with real data calculations. The component uses the existing builder rewards logic from the collective-rewards module.'
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    builder: {
      control: 'text',
      description: 'Builder address',
    },
    gauge: {
      control: 'text',
      description: 'Gauge address',
    },
    currency: {
      control: 'text',
      description: 'Currency for display',
    },
  },
  decorators: [
    (Story) => (
      <ContextProviders>
        <CycleContextProvider>
          <Story />
        </CycleContextProvider>
      </ContextProviders>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// Mock data for stories
const mockProps = {
  builder: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  gauge: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
  gauges: [
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    '0xfedcbafedcbafedcbafedcbafedcbafedcbafedcba' as `0x${string}`,
  ],
  tokens: {
    rif: {
      symbol: 'RIF',
      address: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5' as `0x${string}`,
    },
    rbtc: {
      symbol: 'rBTC',
      address: '0x542fda317318ebf1d3deaf4e0b3326a1b2d3b2b2' as `0x${string}`,
    },
  },
  currency: 'USD',
}

export const Default: Story = {
  args: {
    ...mockProps,
  },
}

export const WithCustomClass: Story = {
  args: {
    ...mockProps,
    className: 'p-4 bg-gray-100 rounded-lg',
  },
}
