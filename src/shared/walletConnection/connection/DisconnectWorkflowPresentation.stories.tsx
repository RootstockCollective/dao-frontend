import type { Meta, StoryObj } from '@storybook/react'
import { DisconnectWorkflowPresentation } from './DisconnectWorkflowPresentation'

const meta = {
  title: 'Koto/DAO/DisconnectWorkflowPresentation',
  component: DisconnectWorkflowPresentation,
  argTypes: {
    address: {
      control: 'text',
      description: 'Full wallet address',
    },
    shortAddress: {
      control: 'text',
      description: 'Shortened version of wallet address for display',
    },
    isModalOpened: {
      control: 'boolean',
      description: 'Whether the disconnect confirmation modal is open',
    },
    onOpenModal: {
      action: 'modal opened',
      description: 'Function called when modal should be opened',
    },
    onCloseModal: {
      action: 'modal closed',
      description: 'Function called when modal should be closed',
    },
    onDisconnect: {
      action: 'disconnected',
      description: 'Function called when wallet disconnection is confirmed',
    },
  },
} satisfies Meta<typeof DisconnectWorkflowPresentation>

export default meta
type Story = StoryObj<typeof meta>

// Mock wallet addresses for consistent testing
const MOCK_ADDRESSES = {
  ethereum: '0x742C4B2B6849f8fdbE79A88FEE6E5A4D5B0F9D3E',
  short: '0x742C...9D3E',
  veryLong: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  veryLongShort: '0x1234...cdef',
}

// Basic Variants
export const Default: Story = {
  args: {
    address: MOCK_ADDRESSES.ethereum,
    shortAddress: MOCK_ADDRESSES.short,
    isModalOpened: false,
    onOpenModal: () => console.log('Opening disconnect modal'),
    onCloseModal: () => console.log('Closing disconnect modal'),
    onDisconnect: () => console.log('Wallet disconnected'),
  },
}

export const WithLongAddress: Story = {
  args: {
    address: MOCK_ADDRESSES.veryLong,
    shortAddress: MOCK_ADDRESSES.veryLongShort,
    isModalOpened: false,
    onOpenModal: () => console.log('Opening disconnect modal'),
    onCloseModal: () => console.log('Closing disconnect modal'),
    onDisconnect: () => console.log('Wallet disconnected'),
  },
}

// Address Variants
export const UndefinedAddress: Story = {
  args: {
    address: undefined,
    shortAddress: 'Not Connected',
    isModalOpened: false,
    onOpenModal: () => console.log('Opening disconnect modal'),
    onCloseModal: () => console.log('Closing disconnect modal'),
    onDisconnect: () => console.log('Wallet disconnected'),
  },
}

export const EmptyAddress: Story = {
  args: {
    address: '',
    shortAddress: '',
    isModalOpened: false,
    onOpenModal: () => console.log('Opening disconnect modal'),
    onCloseModal: () => console.log('Closing disconnect modal'),
    onDisconnect: () => console.log('Wallet disconnected'),
  },
}

// Layout Context Variants
export const InNavigationBar: Story = {
  render: args => (
    <nav className="bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <div className="text-xl font-bold">DeFi Protocol</div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-gray-300">
            Dashboard
          </a>
          <a href="#" className="hover:text-gray-300">
            Portfolio
          </a>
          <a href="#" className="hover:text-gray-300">
            Trade
          </a>
          <div className="relative">
            <DisconnectWorkflowPresentation {...args} />
          </div>
        </div>
      </div>
    </nav>
  ),
  args: {
    address: MOCK_ADDRESSES.ethereum,
    shortAddress: MOCK_ADDRESSES.short,
    isModalOpened: false,
    onOpenModal: () => console.log('Nav modal opened'),
    onCloseModal: () => console.log('Nav modal closed'),
    onDisconnect: () => console.log('Nav disconnected'),
  },
}

// Responsive Variants
export const Mobile: Story = {
  args: {
    address: MOCK_ADDRESSES.ethereum,
    shortAddress: MOCK_ADDRESSES.short,
    isModalOpened: false,
    onOpenModal: () => console.log('Mobile modal opened'),
    onCloseModal: () => console.log('Mobile modal closed'),
    onDisconnect: () => console.log('Mobile disconnected'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export const Tablet: Story = {
  args: {
    address: MOCK_ADDRESSES.ethereum,
    shortAddress: MOCK_ADDRESSES.short,
    isModalOpened: false,
    onOpenModal: () => console.log('Tablet modal opened'),
    onCloseModal: () => console.log('Tablet modal closed'),
    onDisconnect: () => console.log('Tablet disconnected'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}

export const Desktop: Story = {
  args: {
    address: MOCK_ADDRESSES.ethereum,
    shortAddress: MOCK_ADDRESSES.short,
    isModalOpened: false,
    onOpenModal: () => console.log('Desktop modal opened'),
    onCloseModal: () => console.log('Desktop modal closed'),
    onDisconnect: () => console.log('Desktop disconnected'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
}
