/**
 * Reads a positive number from an env value, falling back when it is missing, empty or invalid,
 * so a typo in a deployment can't turn a threshold into NaN, zero or a negative figure.
 */
export const positiveNumberOr = (value: string | undefined, fallback: number): number => {
  if (value === undefined || value.trim() === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}
