import { Address } from 'viem'
import { getBuilderStatus } from '@/app/collective-rewards/utils'

export const getIsWhitelistedBuilder = async (builderAddress: Address): Promise<boolean> => {
  const builderState = await getBuilderStatus(builderAddress)
  return builderState.whitelisted
}
