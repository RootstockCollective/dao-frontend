import { CreateBuilderProposalEventLog } from '@/app/proposals/hooks/useFetchLatestProposals'
import { ProposalState } from '@/shared/types'
import { Address } from 'viem'

export const builderStatusOptions = ['Whitelisted', 'In progress'] as const

export type BuilderStatus = (typeof builderStatusOptions)[number]

export type BuilderInfo = {
  address: Address
  status: BuilderStatus
  proposals: CreateBuilderProposalEventLog[]
}

export type ProposalsToState = Record<string, ProposalState>
