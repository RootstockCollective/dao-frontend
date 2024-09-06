export type BuilderStatus = 'Whitelisted' | 'In progress'

export interface BuilderOffChainInfo {
  name: string
  status: BuilderStatus
  proposalDescription: string
  address: string
  joiningData: string
}
