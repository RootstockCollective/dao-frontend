import { GetAddressTokenResult, TokenBalance } from '@/app/user/types'
import { tokenContracts } from '@/lib/contracts'
import { formatUnits } from 'viem'
import Big from '@/lib/big'
import { RIF, RBTC, STRIF, USDRIF, USDT0 } from '@/lib/constants'
import { formatSymbol } from '@/app/shared/formatter'

// Explicitly type the supported token symbols
type SupportedTokenSymbol = typeof RIF | typeof RBTC | typeof STRIF | typeof USDRIF | typeof USDT0

interface SymbolConfig {
  equivalentSymbols: string[]
  currentContract: string
}

const symbolsToGetFromArray = {
  [RIF]: { equivalentSymbols: ['tRIF', RIF], currentContract: tokenContracts[RIF] },
  [RBTC]: { equivalentSymbols: [RBTC, 'tRBTC'], currentContract: tokenContracts[RBTC] },
  [STRIF]: { equivalentSymbols: [STRIF, 'FIRts'], currentContract: tokenContracts[STRIF] },
  [USDRIF]: { equivalentSymbols: [USDRIF], currentContract: tokenContracts[USDRIF] },
  [USDT0]: { equivalentSymbols: [USDT0, 'USD₮0'], currentContract: tokenContracts[USDT0] },
} as const satisfies Record<string, SymbolConfig>

// Token-specific formatting functions
// Converts human-readable balance to wei and uses formatSymbol for consistent formatting
export const formatTokenBalance = (balance: string, symbol: SupportedTokenSymbol): string => {
  const balanceBig = Big(balance)
  // Convert to wei (multiply by 10^18) to use formatSymbol which handles token-specific decimals
  const weiValue = BigInt(balanceBig.times(Big(10).pow(18)).toFixed(0))
  return formatSymbol(weiValue, symbol)
}

export const getTokenBalance = (
  symbol: SupportedTokenSymbol,
  arrayToSearch?: GetAddressTokenResult,
): TokenBalance => {
  const defaultBalance = {
    balance: '0',
    symbol,
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
