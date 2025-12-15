// Formats a percentage number to display at most 2 decimal places, but preserves all decimals if there are fewer than 2
// Examples:
// formatPercentage(10) => 10
// formatPercentage(10.1) => 10.1
// formatPercentage(10.12) => 10.12
// formatPercentage(10.123) => 10.12
// formatPercentage(10.126) => 10.13
export const formatPercentage = (val: number): string => {
  if (val < 0 || val > 100) {
    throw new Error('Percentage value must be between 0 and 100')
  }

  return parseFloat(val.toFixed(2)).toString()
}
