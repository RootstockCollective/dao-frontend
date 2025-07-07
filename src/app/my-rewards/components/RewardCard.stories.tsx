import { RewardCard } from './RewardCard'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof RewardCard> = {
  title: 'Components/MyRewards/RewardCard',
  component: RewardCard,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    isLoading: {
      control: { type: 'boolean' },
      description: 'Controls whether the card shows a loading spinner',
    },
    title: {
      control: { type: 'text' },
      description: 'The title text for the reward card',
    },
    info: {
      control: { type: 'text' },
      description: 'The info text displayed in the tooltip',
    },
    children: {
      control: { type: 'text' },
      description: 'The main content of the card',
    },
    'data-testid': {
      control: { type: 'text' },
      description: 'Test ID for testing purposes',
    },
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof RewardCard>

export const Default: Story = {
  args: {
    isLoading: false,
    title: 'Total Rewards',
    info: 'Total rewards earned from all your contributions',
    children: '1,234.56 RIF',
    'data-testid': 'reward-card-default',
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
    title: 'Total Rewards',
    info: 'Total rewards earned from all your contributions',
    children: '1,234.56 RIF',
    'data-testid': 'reward-card-loading',
  },
}

export const WithComplexContent: Story = {
  args: {
    isLoading: false,
    title: 'Weekly Rewards',
    info: 'Rewards earned this week from your active contributions',
    children: (
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-bold">2,847.32 RIF</div>
        <div className="text-sm text-green-500">+12.5% from last week</div>
      </div>
    ),
    'data-testid': 'reward-card-complex',
  },
}

export const WithMultipleContentItems: Story = {
  args: {
    isLoading: false,
    title: 'Reward Breakdown',
    info: 'Detailed breakdown of your rewards by category',
    children: (
      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <span>Community Building</span>
          <span className="font-semibold">1,200.00 RIF</span>
        </div>
        <div className="flex justify-between">
          <span>Technical Contributions</span>
          <span className="font-semibold">647.32 RIF</span>
        </div>
        <div className="flex justify-between">
          <span>Governance Participation</span>
          <span className="font-semibold">1,000.00 RIF</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold">
          <span>Total</span>
          <span>2,847.32 RIF</span>
        </div>
      </div>
    ),
    'data-testid': 'reward-card-breakdown',
  },
}

export const EmptyState: Story = {
  args: {
    isLoading: false,
    title: 'No Rewards Yet',
    info: 'Start contributing to earn rewards',
    children: (
      <div className="text-center text-gray-500">
        <div className="text-lg">0.00 RIF</div>
        <div className="text-sm">Begin your journey to earn rewards</div>
      </div>
    ),
    'data-testid': 'reward-card-empty',
  },
}

export const WithLongTitle: Story = {
  args: {
    isLoading: false,
    title: 'Very Long Title That Might Wrap to Multiple Lines',
    info: 'This is a very long info text that describes the reward category in detail and might also wrap to multiple lines',
    children: '1,234.56 RIF',
    'data-testid': 'reward-card-long-title',
  },
}

export const WithSpecialCharacters: Story = {
  args: {
    isLoading: false,
    title: 'Special Characters: !@#$%^&*()',
    info: 'Info with special chars: <script>alert("test")</script> & "quotes"',
    children: '1,234.56 RIF',
    'data-testid': 'reward-card-special-chars',
  },
}

export const ResponsiveTest: Story = {
  args: {
    isLoading: false,
    title: 'Responsive Test',
    info: 'This card should adapt to different screen sizes',
    children: '1,234.56 RIF',
    'data-testid': 'reward-card-responsive',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export const DesktopTest: Story = {
  args: {
    isLoading: false,
    title: 'Desktop Test',
    info: 'This card should look good on desktop screens',
    children: '1,234.56 RIF',
    'data-testid': 'reward-card-desktop',
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
}
