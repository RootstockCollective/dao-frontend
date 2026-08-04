import { CycleTimeKeeperAbi } from '@/lib/abis/tok/CycleTimeKeeperAbi'
import { BackersManagerAddress } from '@/lib/contracts'

import { createContractReadHook } from '../createReadHooks'

// The CycleTimeKeeper functions live on the BackersManager deployment.
export const useReadCycleTimeKeeper = createContractReadHook(CycleTimeKeeperAbi, BackersManagerAddress)
