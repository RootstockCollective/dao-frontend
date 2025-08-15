import type { Meta, StoryObj } from '@storybook/nextjs'
import { LatestActiveProposalCard } from './LatestActiveProposalCard'
import { ProposalCategory, ProposalState } from '@/shared/types'
import { Proposal } from '@/app/proposals/shared/types'
import moment from 'moment'
import Big from '@/lib/big'
import { ButtonAction } from '@/app/proposals/components/vote-details'

const meta: Meta<typeof LatestActiveProposalCard> = {
  title: 'LatestCollective/LatestActiveProposalCard',
  component: LatestActiveProposalCard,
}

export default meta

type Story = StoryObj<typeof LatestActiveProposalCard>

const baseMockProposal: Proposal = {
  proposalId: '0x1234567890abcdef',
  name: 'This is a sample proposal name that is long enough to test line clamping in the card component. It should be truncated after three lines.',
  description: 'Sample description for the proposal.',
  category: ProposalCategory.Grants,
  Starts: moment(),
  proposer: '0xabcdefabcdefabcdefabcdefabcdefabcdef',
  votes: {
    forVotes: Big(2000),
    againstVotes: Big(3000),
    abstainVotes: Big(4000),
    quorum: Big(5000),
  },
  blocksUntilClosure: Big(33),
  votingPeriod: Big(0),
  quorumAtSnapshot: Big(4444),
  proposalDeadline: Big(0),
  blockNumber: '44444444',
  proposalState: ProposalState.Active,
  calldatasParsed: [],
  createdAt: '1234567890',
  createdAtBlock: '12345678',
  voteStart: '1234567890',
  voteEnd: '1234567890',
  targets: [],
  values: [],
  calldatas: [],
  votesAgainst: '3000000000000000000000',
  votesFor: '2000000000000000000000',
  votesAbstains: '4000000000000000000000',
  quorum: '5000000000000000000000',
}

const mockButtonAction: ButtonAction = {
  actionName: 'View proposal',
  onButtonClick: () => alert('Vote button clicked!'),
}

export const Default: Story = {
  args: {
    proposal: baseMockProposal,
    votingPower: BigInt(1234),
    buttonAction: mockButtonAction,
  },
}
