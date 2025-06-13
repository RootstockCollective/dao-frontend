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
      for: '99,999,999',
      against: '99,999,999',
      abstain: '99,999,999',
      quorum: '123,456,789',
    },
    votingPower: '4,300',
    buttonAction: {
      onButtonClick: () => {},
      actionName: 'Vote proposal',
    },
    // hasVoted: 'for',
  },
}
