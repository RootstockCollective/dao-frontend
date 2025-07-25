import { Builder, BuilderStateFlags } from '../types'

export const isBuilderOperational = (stateFlags?: BuilderStateFlags) => {
  return Boolean(
    stateFlags?.activated && stateFlags?.communityApproved && stateFlags?.kycApproved && !stateFlags?.paused,
  )
}

export const isBuilderDeactivated = ({ gauge, stateFlags }: Builder) =>
  Boolean(gauge && !stateFlags?.communityApproved)

export const isBuilderKycRevoked = (stateFlags?: BuilderStateFlags) =>
  Boolean(stateFlags?.activated && !stateFlags.kycApproved)

export const isBuilderPaused = (stateFlags?: BuilderStateFlags) => Boolean(stateFlags?.paused)

export const isBuilderSelfPaused = (stateFlags?: BuilderStateFlags) => Boolean(stateFlags?.revoked)

export const isBuilderActive = (stateFlags?: BuilderStateFlags) => {
  return Boolean(
    stateFlags?.communityApproved && stateFlags?.kycApproved && !stateFlags?.paused && !stateFlags?.revoked,
  )
}

export const isBuilderInProgress = (builder: Builder) => {
  const builderFlags = builder.stateFlags
  if (!builderFlags) return true
  if (isBuilderDeactivated(builder) || isBuilderKycRevoked(builderFlags)) return false
  return !builderFlags.activated || !builderFlags.communityApproved
}

export const isBuilderRewardable = (stateFlags?: BuilderStateFlags) => {
  return Boolean(
    stateFlags?.activated && stateFlags?.communityApproved && stateFlags?.kycApproved && !stateFlags?.revoked,
  )
}

export const builderInactiveStates = ['deactivated', 'paused', 'selfPaused', 'kycRevoked'] as const
export type BuilderInactiveState = (typeof builderInactiveStates)[number]
export const getBuilderInactiveState = (builder: Builder): BuilderInactiveState | null => {
  if (isBuilderDeactivated(builder)) return 'deactivated'
  if (isBuilderKycRevoked(builder.stateFlags)) return 'kycRevoked'
  if (isBuilderPaused(builder.stateFlags)) return 'paused'
  if (isBuilderSelfPaused(builder.stateFlags)) return 'selfPaused'
  return null
}

export const builderInactiveStateMessage: Record<BuilderInactiveState, string> = {
  deactivated: 'The Builder was voted out by the community.',
  kycRevoked: 'The Builder was removed by the Foundation.',
  paused: 'The Builder’s KYC has been paused by the Foundation.',
  selfPaused: 'The Builder has paused their participation.',
} as const
