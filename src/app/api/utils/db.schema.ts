export interface LastProcessedBlock {
  id: boolean
  hash: string
  number: bigint
  timestamp: Date
}

export interface ProposalLike {
  id: number
  proposalId: Buffer
  userAddress: string
  likedAt: Date
  reaction: string
}
