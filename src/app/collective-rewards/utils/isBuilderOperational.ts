import { BuilderStateFlags } from '../types'

export const isBuilderOperational = (stateFlags?: BuilderStateFlags) => {
  return !!(stateFlags && stateFlags.communityApproved && stateFlags.kycApproved && !stateFlags.paused)
}

const inactiveStates = ['Deactivated', 'KYCRevoked', 'Revoked', 'Paused'] as const
type InactiveStates = (typeof inactiveStates)[number]
export const getBuilderInactiveState = (state: BuilderStateFlags): InactiveStates => {
  if (!state.communityApproved) return 'Deactivated'
  if (!state.kycApproved) return 'KYCRevoked'
  if (state.revoked) return 'Revoked'
  return 'Paused'
}
