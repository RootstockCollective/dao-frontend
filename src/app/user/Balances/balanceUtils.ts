import { GetAddressTokenResult, TokenBalance } from '@/app/user/types'
import { tokenContracts } from '@/lib/contracts'
import { formatUnits } from 'viem'
import { formatNumberWithCommas } from '@/lib/utils'
import Big from '@/lib/big'
import { RIF, RBTC, STRIF, USDRIF, USDT0 } from '@/lib/constants'

const symbolsToGetFromArray = {
  [RIF]: { equivalentSymbols: ['tRIF', 'RIF'], currentContract: tokenContracts[RIF] },
  [RBTC]: {
    equivalentSymbols: ['rBTC', 'RBTC', 'tRBTC'],
    currentContract: tokenContracts[RBTC],
  },
  [STRIF]: { equivalentSymbols: [STRIF, 'FIRts'], currentContract: tokenContracts[STRIF] },
  [USDRIF]: { equivalentSymbols: [USDRIF], currentContract: tokenContracts[USDRIF] },
  [USDT0]: { equivalentSymbols: [USDT0], currentContract: tokenContracts[USDT0] },
}

type SymbolsEquivalentKeys = keyof typeof symbolsToGetFromArray

// Token-specific formatting functions
export const formatTokenBalance = (balance: string, symbol: SymbolsEquivalentKeys): string => {
  const balanceBig = Big(balance)

  switch (symbol) {
    case RIF:
    case STRIF:
      return formatNumberWithCommas(balanceBig.floor())
    case USDRIF:
      return formatNumberWithCommas(balanceBig.toFixedNoTrailing(2))
    case USDT0:
      return formatNumberWithCommas(balanceBig.toFixedNoTrailing(2))
    case RBTC:
    default:
      return formatNumberWithCommas(balanceBig.toFixedNoTrailing(5))
  }
}

export const getTokenBalance = (
  symbol: SymbolsEquivalentKeys,
  arrayToSearch?: GetAddressTokenResult,
): TokenBalance => {
  const defaultBalance = {
    balance: '0',
    symbol: symbol as string,
    formattedBalance: '0',
  }

  if (!Array.isArray(arrayToSearch)) {
    return defaultBalance
  }

  const { equivalentSymbols, currentContract } = symbolsToGetFromArray[symbol]
  const normalizedContract = currentContract.toLowerCase()

  // First try to match by both symbol and contract address
  let matchingToken = arrayToSearch.find(token => {
    const tokenSymbolMatches = equivalentSymbols.some(
      equivalentSymbol => token.symbol?.toLowerCase() === equivalentSymbol.toLowerCase(),
    )
    const contractMatches = token.contractAddress.toLowerCase() === normalizedContract
    return tokenSymbolMatches && contractMatches
  })

  // If no match, try matching by contract address only (in case symbol differs)
  if (!matchingToken) {
    matchingToken = arrayToSearch.find(token => token.contractAddress.toLowerCase() === normalizedContract)
  }

  if (!matchingToken) {
    return defaultBalance
  }

  // Use decimals from the token data (defaults to 18 if not available)
  const decimals = matchingToken.decimals ?? 18
  const balance = formatUnits(BigInt(matchingToken.balance), decimals)

  return {
    balance,
    symbol: matchingToken.symbol,
    formattedBalance: formatTokenBalance(balance, symbol),
  }
}
