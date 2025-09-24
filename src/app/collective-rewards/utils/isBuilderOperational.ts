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

export const BUILDER_IN_PROGRESS = 'inProgress'
export const BUILDER_ACTIVE = 'active'
export const BUILDER_DEACTIVATED = 'deactivated'
export const BUILDER_KYC_REVOKED = 'kycRevoked'
export const BUILDER_PAUSED = 'paused'
export const BUILDER_SELF_PAUSED = 'selfPaused'

export const builderInactiveStates = [
  BUILDER_DEACTIVATED,
  BUILDER_KYC_REVOKED,
  BUILDER_PAUSED,
  BUILDER_SELF_PAUSED,
] as const
export type BuilderInactiveState = (typeof builderInactiveStates)[number]
export const getBuilderInactiveState = (builder: Builder): BuilderInactiveState | null => {
  if (isBuilderDeactivated(builder)) return BUILDER_DEACTIVATED
  if (isBuilderKycRevoked(builder.stateFlags)) return BUILDER_KYC_REVOKED
  if (isBuilderPaused(builder.stateFlags)) return BUILDER_PAUSED
  if (isBuilderSelfPaused(builder.stateFlags)) return BUILDER_SELF_PAUSED
  return null
}

export const builderInactiveStateMessage: Record<BuilderInactiveState, string> = {
  [BUILDER_DEACTIVATED]: 'The Builder was voted out by the community.',
  [BUILDER_KYC_REVOKED]: 'The Builder was removed by the Foundation.',
  [BUILDER_PAUSED]: 'The Builder’s KYC has been paused by the Foundation.',
  [BUILDER_SELF_PAUSED]: 'The Builder has paused their participation.',
} as const
