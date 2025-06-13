import Big from '@/lib/big'
import { DecodedData } from '@/app/proposals/shared/utils'
export interface IProposal {
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
  proposalState: string
  category: string
  name: string
  proposer: `0x${string}`
  description: string
  proposalId: string
  Starts: moment.Moment
  calldatasParsed: DecodedData[]
  blockNumber: string
}
