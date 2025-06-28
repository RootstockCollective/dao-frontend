export const floorToUnit = (value: bigint, unit = 18n): bigint => (value / 10n ** unit) * 10n ** unit
