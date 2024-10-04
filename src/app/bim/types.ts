import { CreateBuilderProposalEventLog } from '@/app/proposals/hooks/useFetchLatestProposals'

export type BuilderStatus = 'Whitelisted' | 'In progress'

export interface BuilderInfo {
  address: string
  status: BuilderStatus
  proposals: CreateBuilderProposalEventLog[]
}
