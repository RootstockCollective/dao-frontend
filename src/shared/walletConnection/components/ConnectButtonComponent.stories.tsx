import type { Meta, StoryObj } from '@storybook/react'
import { ConnectButtonComponent, ConnectButtonComponentSecondary } from './ConnectButtonComponent'
import { userEvent, within, expect } from '@storybook/test'

const meta = {
  title: 'Koto/DAO/ConnectButtonComponent',
  component: ConnectButtonComponent,
  argTypes: {
    onClick: {
      action: 'clicked',
      description: 'Function called when the connect wallet button is clicked',
    },
  },
} satisfies Meta<typeof ConnectButtonComponent>

export default meta
type Story = StoryObj<typeof meta>

// Basic Variants
export const Default: Story = {
  args: {
    onClick: () => console.log('Connect Wallet clicked'),
  },
}

export const Primary: Story = {
  args: {
    onClick: () => console.log('Primary Connect Wallet clicked'),
  },
}

// Secondary Variant (using the secondary component)
export const Secondary: Story = {
  render: args => <ConnectButtonComponentSecondary {...args} />,
  args: {
    onClick: () => console.log('Secondary Connect Wallet clicked'),
  },
}

// Interactive Variants
export const WithWalletConnection: Story = {
  args: {
    onClick: () => {
      console.log('Initiating wallet connection...')
      // Simulate connection process
      setTimeout(() => {
        console.log('Wallet connection successful!')
      }, 1000)
    },
  },
}

export const WithErrorHandling: Story = {
  args: {
    onClick: () => {
      console.log('Attempting wallet connection...')
      try {
        // Simulate potential error scenarios
        if (Math.random() > 0.5) {
          throw new Error('Wallet not found')
        }
        console.log('Wallet connected successfully!')
      } catch (error) {
        console.error('Connection failed:', error)
      }
    },
  },
}

// Responsive Variants
export const Mobile: Story = {
  args: {
    onClick: () => console.log('Mobile Connect Wallet clicked'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export const Desktop: Story = {
  args: {
    onClick: () => console.log('Desktop Connect Wallet clicked'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
}

// Comparison Variants
export const VariantComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h3 className="mb-2 text-sm font-bold">Primary Variant</h3>
        <ConnectButtonComponent onClick={() => console.log('Primary variant clicked')} />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold">Secondary Variant</h3>
        <ConnectButtonComponentSecondary onClick={() => console.log('Secondary variant clicked')} />
      </div>
    </div>
  ),
  args: {
    onClick: () => console.log('Comparison clicked'),
  },
  parameters: {
    controls: { disable: true },
  },
}

// Layout Context Variants
export const InForm: Story = {
  render: args => (
    <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Connect Your Wallet</h2>
      <p className="text-gray-600 mb-6">
        To continue, please connect your cryptocurrency wallet to access all features.
      </p>
      <ConnectButtonComponent {...args} />
      <p className="text-xs text-gray-500 mt-4">
        We support MetaMask, WalletConnect, and other popular wallets.
      </p>
    </div>
  ),
  args: {
    onClick: () => console.log('Form Connect Wallet clicked'),
  },
}

export const InModal: Story = {
  render: args => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">Wallet Connection Required</h3>
        <p className="text-gray-600 mb-6">Please connect your wallet to continue with this transaction.</p>
        <div className="flex flex-col gap-3">
          <ConnectButtonComponent {...args} />
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md">Cancel</button>
        </div>
      </div>
    </div>
  ),
  args: {
    onClick: () => console.log('Modal Connect Wallet clicked'),
  },
}

export const InNavigation: Story = {
  render: args => (
    <nav className="bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <div className="text-xl font-bold">DeFi App</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-gray-300">
            Dashboard
          </a>
          <a href="#" className="hover:text-gray-300">
            Portfolio
          </a>
          <a href="#" className="hover:text-gray-300">
            Trade
          </a>
          <ConnectButtonComponent {...args} />
        </div>
      </div>
    </nav>
  ),
  args: {
    onClick: () => console.log('Navigation Connect Wallet clicked'),
  },
}

// State Simulation Variants
export const ConnectingState: Story = {
  args: {
    onClick: () => {
      console.log('Connecting to wallet...')
      console.log('Please check your wallet for connection request')
    },
  },
}

export const RetryConnection: Story = {
  args: {
    onClick: () => {
      console.log('Retrying wallet connection...')
      console.log('If this fails, try refreshing your wallet extension')
    },
  },
}

// Testing Story with Play Function
export const WithPlayFunction: Story = {
  args: {
    onClick: () => console.log('Play function test clicked'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const connectButton = canvas.getByTestId('ConnectWallet')

    // Verify button exists and has correct text
    await expect(connectButton).toBeInTheDocument()
    await expect(connectButton).toHaveTextContent('Connect Wallet')

    // Test click interaction
    await userEvent.click(connectButton)

    // Verify button is clickable
    expect(connectButton).not.toBeDisabled()
  },
}

// Accessibility Testing
export const AccessibilityTest: Story = {
  args: {
    onClick: () => console.log('Accessibility test clicked'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const connectButton = canvas.getByTestId('ConnectWallet')

    // Check accessibility attributes
    await expect(connectButton).toBeInTheDocument()
    await expect(connectButton).toHaveAttribute('type', 'button')
    await expect(connectButton).toHaveAttribute('data-testid', 'ConnectWallet')

    // Test keyboard navigation
    connectButton.focus()
    await expect(connectButton).toHaveFocus()

    // Test click with keyboard
    await userEvent.keyboard('{Enter}')
  },
}

// Edge Cases
export const MultipleClicks: Story = {
  args: {
    onClick: () => {
      console.log('Multiple clicks - should handle gracefully')
      console.log('Implement debouncing if needed')
    },
  },
}

export const SlowConnection: Story = {
  args: {
    onClick: () => {
      console.log('Simulating slow wallet connection...')
      setTimeout(() => {
        console.log('Connection established after delay')
      }, 3000)
    },
  },
}
