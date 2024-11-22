import { WeiPerEther } from 'ethers'

export function weiToPercentage(weiValue: bigint, decimalsLimit?: number): string {
  const scaledWei = weiValue * 100n
  const whole = scaledWei / WeiPerEther
  const remainder = scaledWei % WeiPerEther

  // Scale to 18 decimal places
  const decimals = remainder.toString().padStart(decimalsLimit ?? 18, '0')
  const formattedDecimals = decimals.replace(/0+$/, '')

  return formattedDecimals
    ? `${whole}.${decimalsLimit ? formattedDecimals.slice(0, decimalsLimit) : formattedDecimals}`
    : whole.toString()
}

export function percentageToWei(percentage: string): bigint {
  const [whole, decimal = ''] = percentage.split('.')
  const numDigits = decimal.length

  const numerator = BigInt(whole + decimal)
  const denominator = BigInt(10 ** numDigits) * 100n // Convert percentage to a fraction and scale
  const weiValue = (numerator * WeiPerEther) / denominator

  return weiValue
}
