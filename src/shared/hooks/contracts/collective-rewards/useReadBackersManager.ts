import { BackersManagerAbi } from '@/lib/abis/tok/BackersManagerAbi'
import { BackersManagerAddress } from '@/lib/contracts'

import { createContractReadHook } from '../createReadHooks'

export const useReadBackersManager = createContractReadHook(BackersManagerAbi, BackersManagerAddress)
