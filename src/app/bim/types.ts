import { CreateBuilderProposalEventLog } from '@/app/proposals/hooks/useFetchLatestProposals'
import { ProposalState } from '@/shared/types'

export const builderStatusOptions = ['Whitelisted', 'In progress'] as const

export type BuilderStatus = (typeof builderStatusOptions)[number]

export interface BuilderInfo {
  address: string
  status: BuilderStatus
  proposals: CreateBuilderProposalEventLog[]
}

export const invalidProposalStates = [ProposalState.Canceled, ProposalState.Defeated, ProposalState.Expired]
