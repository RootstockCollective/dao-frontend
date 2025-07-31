import { Address } from 'viem'

export const getBuilderColor = (address?: Address) => `#${address?.slice(-6).toUpperCase()}`
