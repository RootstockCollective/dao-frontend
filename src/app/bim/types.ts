export type BuilderStatus = 'Whitelisted' | 'In progress' | 'KYC Under Review' | 'KYC Approved'

export interface BuilderOffChainInfo {
  name: string
  status: BuilderStatus
  proposalDescription: string
  address: string
  joiningData: string
}
