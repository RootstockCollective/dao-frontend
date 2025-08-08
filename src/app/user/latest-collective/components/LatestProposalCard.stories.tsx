import type { Meta, StoryObj } from '@storybook/react'
import { LatestProposalCard } from './LatestProposalCard'
import { ProposalCategory, ProposalState } from '@/shared/types'
import { Proposal } from '@/app/proposals/shared/types'
import moment from 'moment'
import Big from '@/lib/big'

const meta: Meta<typeof LatestProposalCard> = {
  title: 'LatestCollective/LatestProposalCard',
  component: LatestProposalCard,
}

export default meta

type Story = StoryObj<typeof LatestProposalCard>

const mockProposal: Proposal = {
  proposalId: '0x1234567890abcdef',
  name: 'This is a sample proposal name that is long enough to test line clamping in the card component. It should be truncated after three lines.',
  description:
    'asjfbiasfonsaofnsahifbojasnfihsabfoas fguhsanfdoas guhjdniaso fhiasbnfihsa bfjhsaf ahis fuhjasbfiasbfjhsabfnksabfiksab fk',
  category: ProposalCategory.Grants,
  Starts: moment(),
  proposer: '0xabcdefabcdefabcdefabcdefabcdefabcdef',
  votes: {
    forVotes: Big(2000),
    againstVotes: Big(3000),
    abstainVotes: Big(4000),
    quorum: Big(5000),
  },
  blocksUntilClosure: Big(0),
  votingPeriod: Big(0),
  quorumAtSnapshot: Big(0),
  proposalDeadline: Big(0),
  blockNumber: '44444444',
  proposalState: ProposalState.Active,
  calldatasParsed: [],
}

const mockProposal2: Proposal = {
  proposalId: '0x1234567890abcdef',
  name: 'Simple and short name for the proposal',
  description:
    'asjfbiasfonsaofnsahifbojasnfihsabfoas fguhsanfdoas guhjdniaso fhiasbnfihsa bfjhsaf ahis fuhjasbfiasbfjhsabfnksabfiksab fk',
  category: ProposalCategory.Grants,
  Starts: moment(),
  proposer: '0xabcdefabcdefabcdefabcdefabcdefabcdef',
  votes: {
    forVotes: Big(2000),
    againstVotes: Big(3000),
    abstainVotes: Big(4000),
    quorum: Big(5000),
  },
  blocksUntilClosure: Big(0),
  votingPeriod: Big(0),
  quorumAtSnapshot: Big(0),
  proposalDeadline: Big(0),
  blockNumber: '44444444',
  proposalState: ProposalState.Active,
  calldatasParsed: [],
}

const mockProposal3: Proposal = {
  proposalId: '0x1234567890abcdef',
  name: 'Different Category',
  description:
    'asjfbiasfonsaofnsahifbojasnfihsabfoas fguhsanfdoas guhjdniaso fhiasbnfihsa bfjhsaf ahis fuhjasbfiasbfjhsabfnksabfiksab fk',
  category: ProposalCategory.Activation,
  Starts: moment(),
  proposer: '0xabcdefabcdefabcdefabcdefabcdefabcdef',
  votes: {
    forVotes: Big(2000),
    againstVotes: Big(3000),
    abstainVotes: Big(4000),
    quorum: Big(5000),
  },
  blocksUntilClosure: Big(0),
  votingPeriod: Big(0),
  quorumAtSnapshot: Big(0),
  proposalDeadline: Big(0),
  blockNumber: '44444444',
  proposalState: ProposalState.Active,
  calldatasParsed: [],
}

export const Default: Story = {
  args: {
    proposal: mockProposal,
  },
}

export const ShortName: Story = {
  args: {
    proposal: mockProposal2,
  },
}
export const DifferentCategory: Story = {
  args: {
    proposal: mockProposal3,
  },
}
