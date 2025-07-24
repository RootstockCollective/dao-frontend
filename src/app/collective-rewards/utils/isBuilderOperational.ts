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

const inactiveStates = ['Deactivated', 'Paused', 'Revoked'] as const
export type InactiveState = (typeof inactiveStates)[number]
export const getBuilderInactiveState = (state: BuilderStateFlags): InactiveState => {
  if (!state.communityApproved) return 'Deactivated'
  if (!state.kycApproved) return 'Deactivated'
  if (state.revoked) return 'Revoked'
  return 'Paused'
}
