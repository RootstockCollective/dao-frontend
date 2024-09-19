import { Status } from '@/components/Status'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, spyOn, userEvent, within } from '@storybook/test'

const meta = {
  title: 'Components/Status',
  component: Status,
} satisfies Meta<typeof Status>

export default meta

type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: {
    severity: 'success',
  },
}

export const InProgress: Story = {
  args: {
    severity: 'in-progress',
  },
}

export const Rejected: Story = {
  args: {
    severity: 'rejected',
  },
}

export const Canceled: Story = {
  args: {
    severity: 'canceled',
  },
}

export const TestDivEvent: Story = {
  args: {
    severity: 'success',
    onClick: () => console.log('Clicked'),
  },
  play: async ({ canvasElement }) => {
    const consoleLogSpy = spyOn(console, 'log')

    const canvas = within(canvasElement)
    const button = canvas.getByText('Test Click')
    await userEvent.click(button)

    await expect(consoleLogSpy).toHaveBeenCalledOnce()
    await expect(consoleLogSpy).toHaveBeenCalledWith('Clicked')

    consoleLogSpy.mockRestore()
  },
}
