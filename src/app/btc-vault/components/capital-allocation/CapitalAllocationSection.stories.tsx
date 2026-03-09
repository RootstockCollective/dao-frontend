import type { Meta, StoryObj } from '@storybook/nextjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { CapitalAllocationSection } from './CapitalAllocationSection'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const meta = {
  title: 'BTC Vault/CapitalAllocationSection',
  component: CapitalAllocationSection,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <QueryClientProvider client={queryClient}>
        <div className="w-full p-6">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof CapitalAllocationSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
