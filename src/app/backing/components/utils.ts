import { Address } from 'viem'

export const floorToUnit = (value: bigint, unit = 18n): bigint => (value / 10n ** unit) * 10n ** unit
export const getBuilderColor = (address?: Address) => `#${address?.slice(-6).toUpperCase()}`
