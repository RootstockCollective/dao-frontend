import { parseUnits } from 'viem'

export const applyPrecision = (value: bigint, precision = 18) => value / parseUnits('1', precision)
