import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { SimplifiedRewardDistributorAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { config } from '@/config'
import { readContract } from 'wagmi/actions'

export const getIsWhitelistedBuilder = async (builderAddress: Address): Promise<boolean> => {
  return readContract(config, {
    address: SimplifiedRewardDistributorAddress,
    abi: SimplifiedRewardDistributorAbi,
    functionName: 'isWhitelisted',
    args: [builderAddress],
  })
}
