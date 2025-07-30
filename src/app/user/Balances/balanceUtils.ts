import { GetAddressTokenResult, TokenBalance } from '@/app/user/types'
import { tokenContracts } from '@/lib/contracts'
import { formatEther } from 'viem'
import { formatNumberWithCommas } from '@/lib/utils'
import Big from '@/lib/big'

const symbolsToGetFromArray = {
  RIF: { equivalentSymbols: ['tRIF', 'RIF'], currentContract: tokenContracts.RIF },
  RBTC: { equivalentSymbols: ['RBTC', 'tRBTC'], currentContract: tokenContracts.RBTC },
  stRIF: { equivalentSymbols: ['stRIF', 'FIRts'], currentContract: tokenContracts.stRIF },
  USDRIF: { equivalentSymbols: ['USDRIF'], currentContract: tokenContracts.USDRIF },
}

export type SymbolsEquivalentKeys = keyof typeof symbolsToGetFromArray

// Token-specific formatting functions
const formatTokenBalance = (balance: string, symbol: SymbolsEquivalentKeys): string => {
  const balanceBig = Big(balance)

  switch (symbol) {
    case 'RIF':
    case 'stRIF':
      // RIF and stRIF show whole numbers (floor)
      return formatNumberWithCommas(balanceBig.floor())
    case 'USDRIF':
      // USDRIF shows up to 2 decimal places
      return formatNumberWithCommas(balanceBig.toFixedNoTrailing(2))
    case 'RBTC':
    default:
      // RBTC shows 8 decimal places
      return formatNumberWithCommas(balanceBig.toFixedNoTrailing(8))
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

  const matchingToken = arrayToSearch.find(token => {
    const tokenSymbolMatches = equivalentSymbols.some(
      equivalentSymbol => token.symbol?.toLowerCase() === equivalentSymbol.toLowerCase(),
    )
    const contractMatches = token.contractAddress.toLowerCase() === normalizedContract
    return tokenSymbolMatches && contractMatches
  })

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
