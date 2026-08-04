import { BuilderRegistryAbi } from '@/lib/abis/tok/BuilderRegistryAbi'
import { BuilderRegistryAddress } from '@/lib/contracts'

import { createContractMultiArgsReadHook } from '../createReadHooks'

export const useReadBuilderRegistryForMultipleArgs = createContractMultiArgsReadHook(
  BuilderRegistryAbi,
  BuilderRegistryAddress,
  'BuilderRegistry',
)
