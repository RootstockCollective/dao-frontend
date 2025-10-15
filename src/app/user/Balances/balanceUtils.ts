import { AddressToken, TokenBalance } from '@/app/user/types'
import Big from '@/lib/big'
import { isValidTokenAddress, RBTC, RIF, STRIF, TokenSymbol, USDRIF } from '@/lib/tokens'
import { formatNumberWithCommas } from '@/lib/utils'
import { formatEther } from 'viem'

// Token-specific formatting functions
export const formatTokenBalance = (balance: string, symbol: TokenSymbol): string => {
  const balanceBig = Big(balance)

  switch (symbol) {
    case RIF:
    case STRIF:
      return formatNumberWithCommas(balanceBig.floor())
    case USDRIF:
      return formatNumberWithCommas(balanceBig.toFixedNoTrailing(2))
    case RBTC:
    default:
      return formatNumberWithCommas(balanceBig.toFixedNoTrailing(5))
  }
}

export const getTokenBalance = (
  symbol: TokenSymbol,
  arrayToSearch?: AddressToken[],
): TokenBalance => {
  const defaultBalance: TokenBalance = {
    symbol,
    balance: '0',
    formattedBalance: '0',
  }

  if (!Array.isArray(arrayToSearch)) {
    return defaultBalance
  }


  const matchingToken = arrayToSearch.find(({ symbol, contractAddress }) => isValidTokenAddress(symbol, contractAddress))

  if (!matchingToken) {
    return defaultBalance
  }

  const balance = formatEther(BigInt(matchingToken.balance))

  return {
    balance,
    symbol: matchingToken.symbol,
    formattedBalance: formatTokenBalance(balance, symbol),
  }
}
