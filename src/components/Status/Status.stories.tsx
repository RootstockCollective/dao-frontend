import type { Meta, StoryObj } from '@storybook/react'
import { Status } from '@/components/Status/Status'
import { expect, spyOn, userEvent, within } from '@storybook/test'

const meta = {
  title: 'Components/Status',
  component: Status
} satisfies Meta<typeof Status>

export default meta

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    severity: 'success',
    label: 'This is a test',
  }
}

export const Success: Story = {
  args: {
    severity: 'success',
    label: 'Success'
  }
}

export const InProgress: Story = {
  args: {
    severity: 'in-progress',
    label: 'In Progress'
  }
}

export const Rejected: Story = {
  args: {
    severity: 'rejected',
    label: 'Rejected'
  }
}

export const Cancelled: Story = {
  args: {
    severity: 'cancelled',
    label: 'Cancelled'
  }
}

export const TestDivEvent: Story = {
  args: {
    severity: 'success',
    label: 'Test Click',
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
  }

}
