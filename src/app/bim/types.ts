import { CreateBuilderProposalEventLog } from '@/app/proposals/hooks/useFetchLatestProposals'
import { ProposalState } from '@/shared/types'

export const builderStatusOptions = ['Whitelisted', 'In progress'] as const

export type BuilderStatus = (typeof builderStatusOptions)[number]

export type BuilderInfo = {
  address: string
  status: BuilderStatus
  proposals: CreateBuilderProposalEventLog[]
}

export type ProposalsStateMap = Record<string, ProposalState>
