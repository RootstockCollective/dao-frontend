import Big from '@/lib/big'
import { formatNumberWithCommas } from '@/lib/utils'

export interface AssetFormattingResult {
  amount: string
  symbol: string
  fiatAmount?: string
}

/**
 * Formats asset data for display in BalanceInfo components
 */
export function formatAssetData(
  title: string,
  bucket: { amount: string; fiatAmount: string } | undefined,
): AssetFormattingResult {
  const isRif = title.toLowerCase().includes('rif')
  const symbol = isRif ? 'RIF' : 'rBTC'

  const amount = bucket?.amount
    ? isRif
      ? formatNumberWithCommas(Big(bucket.amount).ceil())
      : formatNumberWithCommas(Big(bucket.amount).toFixedNoTrailing(8))
    : '0'

  const fiatAmount = bucket?.fiatAmount
    ? `${formatNumberWithCommas(Big(bucket.fiatAmount).toFixed(2))} USD`
    : undefined

  return {
    amount,
    symbol,
    fiatAmount,
  }
}
