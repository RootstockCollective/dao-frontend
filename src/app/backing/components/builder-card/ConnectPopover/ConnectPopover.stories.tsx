import type { Meta, StoryObj } from '@storybook/react'
import { ConnectPopover } from './ConnectPopover'
import { BuilderActionButton } from '../BuilderActionButton/BuilderActionButton'
import { AlertProvider } from '@/app/providers/AlertProvider'

const meta: Meta<typeof ConnectPopover> = {
  title: 'Backing/ConnectPopover',
  component: ConnectPopover,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof ConnectPopover>

export const Default: Story = {
  render: args => (
    <AlertProvider>
      <div className="flex justify-center items-center h-96">
        <ConnectPopover {...args}>
          <BuilderActionButton text="Back builder" onClick={() => {}} testId="storybook-builder-action-btn" />
        </ConnectPopover>
      </div>
    </AlertProvider>
  ),
}

export const OpenByDefault: Story = {
  render: args => (
    <AlertProvider>
      <div className="flex justify-center items-center h-96">
        <ConnectPopover {...args}>
          <BuilderActionButton text="Back builder" onClick={() => {}} testId="storybook-builder-action-btn" />
        </ConnectPopover>
        <div className="mt-4 text-gray-500 pl-6">Hover the button to open the popover.</div>
      </div>
    </AlertProvider>
  ),
}
