export interface BlockChangeLog {
  id: string
  blockNumber: bigint
  timestamp: Date
  updatedEntities: string[]
}
