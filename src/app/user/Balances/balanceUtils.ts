import { BigNumberish, ethers } from 'ethers'
import { GetAddressTokenResult, TokenBalance, TokenBalanceRecord } from '@/app/user/types'

export const formatBalanceToHuman = (balance: BigNumberish, decimal = 18) =>
  ethers.formatUnits(balance, decimal)

const symbolsToGetFromArray = {
  RIF: { equivalentSymbols: ['tRIF', 'RIF'] },
  rBTC: { equivalentSymbols: ['rBTC'] },
  stRIF: { equivalentSymbols: ['stRIF'] },
}

export type SymbolsEquivalentKeys = keyof typeof symbolsToGetFromArray

export const getTokenBalance = (
  symbol: SymbolsEquivalentKeys,
  arrayToSearch: GetAddressTokenResult,
): TokenBalance => {
  const { equivalentSymbols } = symbolsToGetFromArray[symbol]

  const resultToReturn = {
    balance: '0',
    symbol: symbol as string,
  }
  if (!Array.isArray(arrayToSearch)) {
    return resultToReturn
  }

  for (let equivalentSymbol of equivalentSymbols) {
    const tokenData = arrayToSearch.find(
      token => token.symbol.toLowerCase() === equivalentSymbol.toLowerCase(),
    )
    if (tokenData) {
      resultToReturn.balance = formatBalanceToHuman(tokenData.balance)
      resultToReturn.symbol = tokenData.symbol
      return resultToReturn
    }
  }
  return resultToReturn
}

export const getActualUsedSymbol = (symbol: SymbolsEquivalentKeys, mapToSearch: TokenBalanceRecord) => {
  for (let equivalentSymbol of symbolsToGetFromArray[symbol].equivalentSymbols) {
    const token = mapToSearch[equivalentSymbol.toLowerCase()]
    if (token) {
      return token.symbol
    }
  }
  return symbol
}
