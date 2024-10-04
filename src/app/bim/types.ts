import { CreateBuilderProposalEventLog } from '@/app/proposals/hooks/useFetchLatestProposals'

export const builderStatusOptions = ['Whitelisted', 'In progress'] as const

export type BuilderStatus = (typeof builderStatusOptions)[number]

export interface BuilderInfo {
  address: string
  status: BuilderStatus
  proposals: CreateBuilderProposalEventLog[]
}
