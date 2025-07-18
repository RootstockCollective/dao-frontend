import { BuilderStateFlags } from '@/app/collective-rewards/types'

export const isActive = (stateFlags?: BuilderStateFlags) => {
  const activeFlags = ['kycApproved', 'communityApproved']
  return activeFlags.every(flag => stateFlags?.[flag as keyof BuilderStateFlags])
}
