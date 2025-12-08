import { GetAddressTokenResult, TokenBalance } from '@/app/user/types'
import { tokenContracts } from '@/lib/contracts'
import { formatEther } from 'viem'
import { formatNumberWithCommas } from '@/lib/utils'
import Big from '@/lib/big'
import { RIF, RBTC, STRIF, USDRIF } from '@/lib/constants'

const symbolsToGetFromArray = {
  [RIF]: { equivalentSymbols: ['tRIF', 'RIF'], currentContract: tokenContracts[RIF] },
  [RBTC]: { equivalentSymbols: ['rBTC', 'RBTC', 'tRBTC'], currentContract: tokenContracts[RBTC] },
  [STRIF]: { equivalentSymbols: ['stRIF', 'FIRts'], currentContract: tokenContracts[STRIF] },
  [USDRIF]: { equivalentSymbols: ['USDRIF'], currentContract: tokenContracts[USDRIF] },
}

type SymbolsEquivalentKeys = keyof typeof symbolsToGetFromArray

/**
 * Token-specific formatting functions
 * @param balance - The balance as a string
 * @param symbol - The token symbol
 * @param options - Optional formatting options
 * @param options.useNewUSDRIFDecimals - When true, formats USDRIF with 2 decimals (preserving trailing zeros)
 *                                        instead of using toFixedNoTrailing. This option is intended for
 *                                        incremental rollout of the new USDRIF decimal formatting.
 */
export const formatTokenBalance = (
  balance: string,
  symbol: SymbolsEquivalentKeys,
  options?: { useNewUSDRIFDecimals?: boolean },
): string => {
  const balanceBig = Big(balance)

  switch (symbol) {
    case RIF:
    case STRIF:
      return formatNumberWithCommas(balanceBig.floor())
    case USDRIF:
      // Use toFixed(2) instead of toFixedNoTrailing(2) when useNewUSDRIFDecimals is true
      if (options?.useNewUSDRIFDecimals) {
        return formatNumberWithCommas(balanceBig.toFixed(2))
      }
      return formatNumberWithCommas(balanceBig.toFixedNoTrailing(2))
    case RBTC:
    default:
      return formatNumberWithCommas(balanceBig.toFixedNoTrailing(5))
  }
}

/**
 * Gets token balance from an array of token results
 * @param symbol - The token symbol to search for
 * @param arrayToSearch - Array of token results to search in
 * @param options - Optional formatting options
 * @param options.useNewUSDRIFDecimals - When true, formats USDRIF with 2 decimals. This option is
 *                                        intended for incremental rollout of the new USDRIF decimal formatting.
 */
export const getTokenBalance = (
  symbol: SymbolsEquivalentKeys,
  arrayToSearch?: GetAddressTokenResult,
  options?: { useNewUSDRIFDecimals?: boolean },
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
    formattedBalance: formatTokenBalance(balance, symbol, options),
  }
}
