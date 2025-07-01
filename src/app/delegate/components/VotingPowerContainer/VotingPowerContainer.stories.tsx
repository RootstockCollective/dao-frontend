import type { Meta, StoryObj } from '@storybook/react'
import { VotingPowerContainer } from '@/app/delegate/components/VotingPowerContainer/VotingPowerContainer'

const meta = {
  title: 'KOTO/DAO/VotingPowerContainer',
  component: VotingPowerContainer,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    cards: {
      description: 'Card states for each voting power category',
      control: { type: 'object' },
    },
  },
} satisfies Meta<typeof VotingPowerContainer>

export default meta
type Story = StoryObj<typeof meta>

// Mock data for different scenarios
const createMockCards = (overrides = {}) => ({
  available: {
    contentValue: '1,234.56',
    isLoading: false,
  },
  own: {
    contentValue: '2,000.00',
    isLoading: false,
  },
  received: {
    contentValue: '567.89',
    isLoading: false,
  },
  delegated: {
    contentValue: '1,333.33',
    isLoading: false,
  },
  ...overrides,
})

export const Default: Story = {
  args: {
    cards: createMockCards(),
  },
}

export const WithLargeNumbers: Story = {
  args: {
    cards: createMockCards({
      available: {
        contentValue: '1,234,567.89',
        isLoading: false,
      },
      own: {
        contentValue: '9,876,543.21',
        isLoading: false,
      },
      received: {
        contentValue: '456,789.12',
        isLoading: false,
      },
      delegated: {
        contentValue: '8,543,210.98',
        isLoading: false,
      },
    }),
  },
}

export const WithSmallNumbers: Story = {
  args: {
    cards: createMockCards({
      available: {
        contentValue: '0.001',
        isLoading: false,
      },
      own: {
        contentValue: '0.05',
        isLoading: false,
      },
      received: {
        contentValue: '0.123',
        isLoading: false,
      },
      delegated: {
        contentValue: '0.002',
        isLoading: false,
      },
    }),
  },
}

export const WithZeroValues: Story = {
  args: {
    cards: createMockCards({
      available: {
        contentValue: '0',
        isLoading: false,
      },
      own: {
        contentValue: '0',
        isLoading: false,
      },
      received: {
        contentValue: '0',
        isLoading: false,
      },
      delegated: {
        contentValue: '0',
        isLoading: false,
      },
    }),
  },
}

export const WithUndefinedValues: Story = {
  args: {
    cards: createMockCards({
      available: {
        contentValue: undefined,
        isLoading: false,
      },
      own: {
        contentValue: undefined,
        isLoading: false,
      },
      received: {
        contentValue: undefined,
        isLoading: false,
      },
      delegated: {
        contentValue: undefined,
        isLoading: false,
      },
    }),
  },
}

export const AllLoading: Story = {
  args: {
    cards: createMockCards({
      available: {
        contentValue: undefined,
        isLoading: true,
      },
      own: {
        contentValue: undefined,
        isLoading: true,
      },
      received: {
        contentValue: undefined,
        isLoading: true,
      },
      delegated: {
        contentValue: undefined,
        isLoading: true,
      },
    }),
  },
}

export const MixedLoadingStates: Story = {
  args: {
    cards: createMockCards({
      available: {
        contentValue: '1,234.56',
        isLoading: false,
      },
      own: {
        contentValue: undefined,
        isLoading: true,
      },
      received: {
        contentValue: '567.89',
        isLoading: false,
      },
      delegated: {
        contentValue: undefined,
        isLoading: true,
      },
    }),
  },
}

export const LoadingWithValues: Story = {
  args: {
    cards: createMockCards({
      available: {
        contentValue: '1,234.56',
        isLoading: true,
      },
      own: {
        contentValue: '2,000.00',
        isLoading: true,
      },
      received: {
        contentValue: '567.89',
        isLoading: true,
      },
      delegated: {
        contentValue: '1,333.33',
        isLoading: true,
      },
    }),
  },
}

export const WithLongDecimalValues: Story = {
  args: {
    cards: createMockCards({
      available: {
        contentValue: '1,234.123456789',
        isLoading: false,
      },
      own: {
        contentValue: '2,000.987654321',
        isLoading: false,
      },
      received: {
        contentValue: '567.555555555',
        isLoading: false,
      },
      delegated: {
        contentValue: '1,333.999999999',
        isLoading: false,
      },
    }),
  },
}

export const MixedValueStates: Story = {
  args: {
    cards: createMockCards({
      available: {
        contentValue: '1,234.56',
        isLoading: false,
      },
      own: {
        contentValue: '0',
        isLoading: false,
      },
      received: {
        contentValue: undefined,
        isLoading: false,
      },
      delegated: {
        contentValue: undefined,
        isLoading: true,
      },
    }),
  },
}

export const EdgeCaseValues: Story = {
  args: {
    cards: createMockCards({
      available: {
        contentValue: '999,999,999.999',
        isLoading: false,
      },
      own: {
        contentValue: '0.000000001',
        isLoading: false,
      },
      received: {
        contentValue: '1',
        isLoading: false,
      },
      delegated: {
        contentValue: '50.5',
        isLoading: false,
      },
    }),
  },
}
