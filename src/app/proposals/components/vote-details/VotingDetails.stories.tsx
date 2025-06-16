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
      for: '77,999,999',
      against: '99,333,999',
      abstain: '99,77,999',
      quorum: '55,456,789',
    },

    votingPower: '4,300',
    buttonAction: {
      onButtonClick: e => console.log('Allegedly Voted for proposal', e),
      actionName: 'Vote proposal',
    },
  },
}

export const HasVotedFor: Story = {
  args: {
    voteData: {
      for: '11,999,111',
      against: '99,444,999',
      abstain: '99,999,999',
      quorum: '564,456,111',
    },
    votingPower: '4,300',
    buttonAction: {
      onButtonClick: e => console.log('Allegedly call Put on queue'),
      actionName: 'Put on queue',
    },
    hasVoted: 'for',
  },
}

export const HasVotedButNoActionAvailable: Story = {
  args: {
    voteData: {
      for: '8,999,999',
      against: '99,800,999',
      abstain: '99,999,555',
      quorum: '35,35,789',
    },
    votingPower: '4,300',
    hasVoted: 'for',
  },
}

export const HasVotedAgainst: Story = {
  args: {
    voteData: {
      for: '99,444,999',
      against: '99,444,999',
      abstain: '99,67,890',
      quorum: '777,456,789',
    },
    votingPower: '4,300',
    hasVoted: 'against',
  },
}

export const HasVotedAbstain: Story = {
  args: {
    voteData: {
      for: '11,999,999',
      against: '99,999,777',
      abstain: '99,555,999',
      quorum: '333,444,789',
    },
    votingPower: '4,300',
    hasVoted: 'abstain',
  },
}
