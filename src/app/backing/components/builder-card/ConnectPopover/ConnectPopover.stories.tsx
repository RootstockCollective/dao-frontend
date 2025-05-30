import type { Meta, StoryObj } from '@storybook/react'
import { ConnectPopover } from './ConnectPopover'
import { Button } from '@/components/Button'
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
          <Button
            variant="secondary"
            className="border-[#66605C] px-2 py-1"
            textClassName="text-[14px] font-normal"
            onClick={() => {}}
          >
            Back builder
          </Button>
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
          <Button
            variant="secondary"
            className="border-[#66605C] px-2 py-1"
            textClassName="text-[14px] font-normal"
            onClick={() => {}}
          >
            Back builder
          </Button>
        </ConnectPopover>
        <div className="mt-4 text-gray-500 pl-6">Hover the button to open the popover.</div>
      </div>
    </AlertProvider>
  ),
}
