import { WeiPerEther } from 'ethers'

export function weiToPercentage(weiValue: bigint): string {
  const scaledWei = weiValue * 100n
  const whole = scaledWei / WeiPerEther
  const remainder = scaledWei % WeiPerEther

  // Scale to 18 decimal places
  const decimal = remainder.toString().padStart(18, '0')
  const formattedDecimal = decimal.replace(/0+$/, '')

  return formattedDecimal ? `${whole}.${formattedDecimal}` : whole.toString()
}

export function percentageToWei(percentage: string): bigint {
  const [whole, decimal = ''] = percentage.split('.')
  const numDigits = decimal.length

  const numerator = BigInt(whole + decimal)
  const denominator = BigInt(10 ** numDigits) * 100n // Convert percentage to a fraction and scale
  const weiValue = (numerator * WeiPerEther) / denominator

  return weiValue
}
