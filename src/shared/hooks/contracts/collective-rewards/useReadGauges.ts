import { GaugeAbi } from '@/lib/abis/tok/GaugeAbi'

import { createContractMultiAddressReadHook } from '../createReadHooks'

export const useReadGauges = createContractMultiAddressReadHook(GaugeAbi, 'Gauge')
