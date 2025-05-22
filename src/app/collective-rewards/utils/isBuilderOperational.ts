import { Builder, BuilderStateFlags } from '../types'

export const isBuilderOperational = (stateFlags?: BuilderStateFlags) => {
  return !!(
    stateFlags &&
    stateFlags.initialized &&
    stateFlags.communityApproved &&
    stateFlags.kycApproved &&
    !stateFlags.kycPaused
  )
}

export const isBuilderDeactivated = ({ gauge, stateFlags }: Builder) =>
  !!(gauge && stateFlags && !stateFlags.communityApproved)

export const isBuilderKycRevoked = (stateFlags?: BuilderStateFlags) =>
  !!(stateFlags && stateFlags.initialized && !stateFlags.kycApproved)

export const isBuilderPaused = (stateFlags?: BuilderStateFlags) => !!(stateFlags && stateFlags.kycPaused)

export const isBuilderActive = (stateFlags?: BuilderStateFlags) => {
  return !!(
    stateFlags &&
    stateFlags.communityApproved &&
    stateFlags.kycApproved &&
    !stateFlags.kycPaused &&
    !stateFlags.selfPaused
  )
}

export const isBuilderRewardable = (stateFlags?: BuilderStateFlags) => {
  return !!(
    stateFlags &&
    stateFlags.initialized &&
    stateFlags.communityApproved &&
    stateFlags.kycApproved &&
    !stateFlags.selfPaused
  )
}

const inactiveStates = ['Deactivated', 'KYCPaused', 'SelfPaused'] as const
export type InactiveState = (typeof inactiveStates)[number]
export const getBuilderInactiveState = (state: BuilderStateFlags): InactiveState => {
  if (!state.communityApproved) return 'Deactivated'
  if (!state.kycApproved) return 'Deactivated'
  if (state.selfPaused) return 'SelfPaused'
  return 'KYCPaused'
}
