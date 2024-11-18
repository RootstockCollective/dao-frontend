import { CreateBuilderProposalEventLog } from '@/app/proposals/hooks/useFetchLatestProposals'
import { ProposalState } from '@/shared/types'
import { Address } from 'viem'

export const BuilderStatusActive = 'Active'
export const BuilderStatusPaused = 'Paused'
export const BuilderStatusDeactivated = 'Deactivated'
export const BuilderStatusInProgress = 'In progress'
export const BuilderStatusProposalCreatedMVP = 'In progress - mvp'
export const builderStatusOptions = [
  BuilderStatusActive,
  BuilderStatusPaused,
  BuilderStatusDeactivated,
  BuilderStatusInProgress,
  BuilderStatusProposalCreatedMVP,
] as const

export type BuilderStatus = (typeof builderStatusOptions)[number]
export type BuilderStatusShown = Exclude<BuilderInfo['status'], 'In progress - mvp'>

export type BuilderStateDetails = {
  activated: boolean
  kycApproved: boolean
  communityApproved: boolean
  paused: boolean
  revoked: boolean
}

export type BuilderInfo = {
  address: Address
  status: BuilderStatus
  stateDetails: BuilderStateDetails
  proposals: CreateBuilderProposalEventLog[]
  gauge: Address
}

// TODO: refactor BuilderInfo & BuilderProposal
export type Builder = {
  address: Address
  status: BuilderStatus
  gauge: Address
  kickback: number
  builderName: string
  joiningDate: string
}

export type ProposalsToState = Record<string, ProposalState>
