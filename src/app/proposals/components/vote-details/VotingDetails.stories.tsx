import type { Meta, StoryObj } from '@storybook/react'
import { VotingDetails } from './VotingDetails'

const meta: Meta<typeof VotingDetails> = {
  title: 'Components/VotingDetails',
  component: VotingDetails,
}

export default meta
type Story = StoryObj<typeof VotingDetails>

// change the values here to control what component displays
// and what action it takes
export const Default: Story = {
  args: {
    voteData: {
      for: BigInt('77999999'),
      against: BigInt('99333999'),
      abstain: BigInt('9977999'),
      quorum: BigInt('55456789'),
    },

    votingPower: 4300n,
    buttonAction: {
      onButtonClick: e => console.log('Allegedly Voted for proposal', e),
      actionName: 'Vote on proposal',
    },
  },
}

export const HasVotedFor: Story = {
  args: {
    voteData: {
      for: BigInt('11999111'),
      against: BigInt('99444999'),
      abstain: BigInt('99999999'),
      quorum: BigInt('564456111'),
    },
    votingPower: 4300n,
    buttonAction: {
      onButtonClick: e => console.log('Allegedly call Put on queue'),
      actionName: 'Put on queue',
    },
    vote: 'for',
  },
}

export const HasVotedButNoActionAvailable: Story = {
  args: {
    voteData: {
      for: BigInt('8999999'),
      against: BigInt('99800999'),
      abstain: BigInt('99999555'),
      quorum: BigInt('3535789'),
    },
    votingPower: 4300n,
    vote: 'for',
  },
}

export const HasVotedAgainst: Story = {
  args: {
    voteData: {
      for: BigInt('99444999'),
      against: BigInt('99444999'),
      abstain: BigInt('9967890'),
      quorum: BigInt('777456789'),
    },
    votingPower: 4300n,
    vote: 'against',
  },
}

export const HasVotedAbstain: Story = {
  args: {
    voteData: {
      for: BigInt('11999999'),
      against: BigInt('99999777'),
      abstain: BigInt('99555999'),
      quorum: BigInt('333444789'),
    },
    votingPower: 4300n,
    vote: 'abstain',
  },
}
