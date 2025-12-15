import { GetAddressTokenResult, TokenBalance } from '@/app/user/types'
import { tokenContracts } from '@/lib/contracts'
import { formatUnits } from 'viem'
import { formatNumberWithCommas } from '@/lib/utils'
import Big from '@/lib/big'
import { RIF, RBTC, STRIF, USDRIF, USDT0 } from '@/lib/constants'

const symbolsToGetFromArray = {
  [RIF]: { equivalentSymbols: ['tRIF', RIF], currentContract: tokenContracts[RIF] },
  [RBTC]: { equivalentSymbols: ['rBTC', RBTC, 'tRBTC'], currentContract: tokenContracts[RBTC] },
  [STRIF]: { equivalentSymbols: ['stRIF', 'FIRts'], currentContract: tokenContracts[STRIF] },
  [USDRIF]: { equivalentSymbols: [USDRIF], currentContract: tokenContracts[USDRIF] },
  [USDT0]: { equivalentSymbols: [USDT0, 'USD₮0'], currentContract: tokenContracts[USDT0] },
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
      return formatNumberWithCommas(balanceBig.toFixedWithTrailing(2))
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

  const balance = formatUnits(BigInt(matchingToken.balance), matchingToken.decimals ?? 18)

  return {
    balance,
    symbol: matchingToken.symbol,
    formattedBalance: formatTokenBalance(balance, symbol),
  }
}
