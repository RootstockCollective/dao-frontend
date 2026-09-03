import { GaugeAbi } from '@/lib/abis/tok/GaugeAbi'

import { createContractReadWithAddressHook } from '../createReadHooks'

// Gauges are read on demand for a given builder, so they don't poll on every block.
export const useReadGauge = createContractReadWithAddressHook(GaugeAbi, { refetchInterval: false })
