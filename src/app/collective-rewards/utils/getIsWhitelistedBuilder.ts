import { Address } from 'viem'
import { getBuilderState } from '@/app/collective-rewards/utils'

export const getIsWhitelistedBuilder = async (builderAddress: Address): Promise<boolean> => {
  const builderState = await getBuilderState(builderAddress)
  return builderState.whitelisted
}
