import type { Meta, StoryObj } from '@storybook/react'
import { NewProposalCard } from './NewProposalCard'

const meta: Meta<typeof NewProposalCard> = {
  title: 'Proposals/NewProposalCard',
  component: NewProposalCard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the card is in open state',
    },
    image: {
      control: 'text',
      description: 'Image source for the card',
    },
    topTitle: {
      control: 'text',
      description: 'Title for the top section',
    },
    bottomTitle: {
      control: 'text',
      description: 'Title for the bottom section',
    },
    topButtonText: {
      control: 'text',
      description: 'Text for the top button',
    },
    bottomButtonText: {
      control: 'text',
      description: 'Text for the bottom button',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Mock components for the blocks
const GrantTopBlock = (
  <div className="p-6 space-y-4">
    <p className="text-gray-700">Community vote to allocate treasury funds for Grants</p>
    <p className="text-sm text-gray-600">
      What&apos;s in it for the user, short explanation... Lorem ipsum dolor sit amet, consectetur adipiscing
      elit. Vestibulum odio mauris, auctor quis tincidunt quis, accumsan eu tellus.
    </p>
  </div>
)

const GrantBottomBlock = (
  <div className="p-6 space-y-6">
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          Align with ecosystem goals <span className="text-sm">↗</span>
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          Make sure that your project supports the goals of the Rootstock Ecosystem
        </p>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          Post on Discourse <span className="text-sm">↗</span>
        </h4>
        <p className="text-sm text-gray-600 mt-1">Share your proposal idea with the community for feedback</p>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          Complete KYC <span className="text-sm">↗</span>
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          Start your KYC early to avoid delays if your proposal passes the vote
        </p>
      </div>
    </div>
  </div>
)

export const Grant: Story = {
  args: {
    isOpen: false,
    image: '/images/proposals/grant-proposal.png',
    topTitle: 'GRANT',
    bottomTitle: 'Before you apply for a Grant',
    topBlock: GrantTopBlock,
    bottomBlock: GrantBottomBlock,
    topButtonText: 'Apply for a Grant',
    bottomButtonText: 'Continue to details',
  },
}

export const GrantOpen: Story = {
  args: {
    ...Grant.args,
    isOpen: true,
  },
}

export const GrantClosed: Story = {
  args: {
    ...Grant.args,
    isOpen: false,
  },
}

export const GrantAndRewards: Story = {
  args: {},
  render: props => <></>,
}
