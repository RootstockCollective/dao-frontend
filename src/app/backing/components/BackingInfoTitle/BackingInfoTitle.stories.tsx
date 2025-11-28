import type { Meta, StoryObj } from '@storybook/nextjs'
import { BackingInfoTitle } from './BackingInfoTitle'
import { ContextProviders } from '@/app/providers/ContextProviders'

const meta: Meta<typeof BackingInfoTitle> = {
  title: 'Backing/BackingInfoTitle',
  component: BackingInfoTitle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    hasFunds: {
      control: 'boolean',
      description: 'Whether the user has funds to back',
      defaultValue: false,
    },
    isConnected: {
      control: 'boolean',
      description: 'Whether the user is connected with a wallet',
      defaultValue: true,
    },
  },
  decorators: [
    Story => (
      <div className="p-8 max-w-md">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof BackingInfoTitle>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Shows the title with real context data. The behavior depends on whether the user is connected and has allocations.',
      },
    },
  },
}

export const NoAllocations: Story = {
  args: {
    hasFunds: false,
    isConnected: true,
  },
}

export const WithAllocations: Story = {
  args: {
    hasFunds: true,
    isConnected: true,
  },
}

export const NotConnected: Story = {
  args: {
    hasFunds: false,
    isConnected: false,
  },
}
