import { Status } from '@/components/Status'
import { ProposalState } from '@/shared/types'
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
    proposalState: ProposalState.Succeeded,
  },
}

export const Pending: Story = {
  args: {
    proposalState: ProposalState.Pending,
  },
}

export const Active: Story = {
  args: {
    proposalState: ProposalState.Active,
  },
}

export const Executed: Story = {
  args: {
    proposalState: ProposalState.Executed,
  },
}

export const Queued: Story = {
  args: {
    proposalState: ProposalState.Queued,
  },
}

export const Defeated: Story = {
  args: {
    proposalState: ProposalState.Defeated,
  },
}

export const Canceled: Story = {
  args: {
    proposalState: ProposalState.Canceled,
  },
}

export const Expired: Story = {
  args: {
    proposalState: ProposalState.Expired,
  },
}

export const TestDivEvent: Story = {
  args: {
    proposalState: ProposalState.Succeeded,
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
