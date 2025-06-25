import Big from '@/lib/big'
import { DecodedData } from '@/app/proposals/shared/utils'
import { ProposalCategory, ProposalState } from '@/shared/types'
export interface Proposal {
  votes: {
    againstVotes: Big
    forVotes: Big
    abstainVotes: Big
    quorum: Big
  }
  blocksUntilClosure: Big
  votingPeriod: Big
  quorumAtSnapshot: Big
  proposalDeadline: Big
  proposalState: ProposalState
  category: ProposalCategory
  name: string
  proposer: `0x${string}`
  description: string
  proposalId: string
  Starts: moment.Moment
  calldatasParsed: DecodedData[]
  blockNumber: string
}
