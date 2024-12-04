import { Builder, BuilderStateFlags } from '../types'

export const isBuilderOperational = (stateFlags?: BuilderStateFlags) => {
  return !!(
    stateFlags &&
    stateFlags.activated &&
    stateFlags.communityApproved &&
    stateFlags.kycApproved &&
    !stateFlags.paused
  )
}

export const isBuilderDeactivated = ({ gauge, stateFlags }: Builder) =>
  !!(gauge && stateFlags && !stateFlags.communityApproved)

export const isBuilderKycRevoked = (stateFlags?: BuilderStateFlags) =>
  !!(stateFlags && stateFlags.activated && !stateFlags.kycApproved)

export const isBuilderPaused = (stateFlags?: BuilderStateFlags) => !!(stateFlags && stateFlags.paused)

export const isBuilderActive = (stateFlags?: BuilderStateFlags) => {
  return !!(
    stateFlags &&
    stateFlags.communityApproved &&
    stateFlags.kycApproved &&
    !stateFlags.paused &&
    !stateFlags.revoked
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
