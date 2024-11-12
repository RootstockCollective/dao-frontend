import { CreateBuilderProposalEventLog } from '@/app/proposals/hooks/useFetchLatestProposals'
import { ProposalState } from '@/shared/types'
import { Address } from 'viem'

export const BuilderStatusActive = 'Active'
export const BuilderStatusInProgress = 'In progress'
export const BuilderStatusProposalCreatedMVP = 'In progress - mvp'
export const builderStatusOptions = [
  BuilderStatusActive,
  BuilderStatusInProgress,
  BuilderStatusProposalCreatedMVP,
] as const

export type BuilderStatus = (typeof builderStatusOptions)[number]
export type BuilderStatusShown = Exclude<BuilderInfo['status'], 'In progress - mvp'>

export type BuilderInfo = {
  address: Address
  status: BuilderStatus
  proposals: CreateBuilderProposalEventLog[]
}

export type ProposalsToState = Record<string, ProposalState>
