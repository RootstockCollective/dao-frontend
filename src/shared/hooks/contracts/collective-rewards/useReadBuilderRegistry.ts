import { BuilderRegistryAbi } from '@/lib/abis/tok/BuilderRegistryAbi'
import { BuilderRegistryAddress } from '@/lib/contracts'

import { createContractReadHook } from '../createReadHooks'

export const useReadBuilderRegistry = createContractReadHook(BuilderRegistryAbi, BuilderRegistryAddress)
