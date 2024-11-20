import { parseEther } from 'viem'

export const toPercentage = (value: bigint) => Number((value * 100n) / parseEther('1'))
