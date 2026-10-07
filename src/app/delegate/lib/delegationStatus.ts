export type DelegationStatus = 'self' | 'other' | 'none'

export const keepsOwnVotes = (status: DelegationStatus | undefined) => status === 'self' || status === 'none'
