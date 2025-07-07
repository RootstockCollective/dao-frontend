import type { Meta, StoryObj } from '@storybook/react'
import { BuilderRewards } from './BuilderRewards'
import { Address } from 'viem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AlertProvider } from '@/app/providers/AlertProvider'
import { CycleContextProvider } from '@/app/collective-rewards/metrics/context/CycleContext'
import { PricesContextProvider } from '@/shared/context/PricesContext'
import React from 'react'

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
          'This story demonstrates the BuilderRewards component with mock data for RIF, rBTC, and USD values.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  decorators: [
    Story => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      })

      return (
        <QueryClientProvider client={queryClient}>
          <AlertProvider>
            <PricesContextProvider>
              <CycleContextProvider>
                <Story />
              </CycleContextProvider>
            </PricesContextProvider>
          </AlertProvider>
        </QueryClientProvider>
      )
    },
  ],
}

export default meta

// Mock data for stories
const mockBuilderAddress = '0x1234567890123456789012345678901234567890' as Address
const mockGaugeAddress = '0x0987654321098765432109876543210987654321' as Address
const mockGauges = [
  '0x1111111111111111111111111111111111111111',
  '0x2222222222222222222222222222222222222222',
] as Address[]

const mockTokens = {
  rif: {
    symbol: 'RIF',
    address: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5' as Address,
  },
  rbtc: {
    symbol: 'rBTC',
    address: '0x542fda317318ebf1d3deaf76e0b632741a7e637d' as Address,
  },
}

export const Default: StoryObj<typeof BuilderRewards> = {
  args: {
    builder: mockBuilderAddress,
    gauge: mockGaugeAddress,
    gauges: mockGauges,
    tokens: mockTokens,
    currency: 'USD',
    isMock: true,
  },
}

export const WithCustomClass: StoryObj<typeof BuilderRewards> = {
  args: {
    builder: mockBuilderAddress,
    gauge: mockGaugeAddress,
    gauges: mockGauges,
    tokens: mockTokens,
    currency: 'USD',
    className: 'p-4 bg-gray-100 rounded-lg',
    isMock: true,
  },
}
