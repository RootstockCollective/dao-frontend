import type { Meta, StoryObj } from '@storybook/react'
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
    hasAllocations: {
      control: 'boolean',
      description: 'Whether the user has any allocations',
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
    hasAllocations: false,
    isConnected: true,
  },
}

export const WithAllocations: Story = {
  args: {
    hasAllocations: true,
    isConnected: true,
  },
}

export const NotConnected: Story = {
  args: {
    hasAllocations: false,
    isConnected: false,
  },
}
