import { Meta, StoryObj } from '@storybook/react'
import { PrepareProposalDropdown } from './prepare-proposal-dropdown'

const meta = {
  title: 'Components/PrepareProposalDropdown',
  component: PrepareProposalDropdown,
} satisfies Meta<typeof PrepareProposalDropdown>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <PrepareProposalDropdown />,
}
