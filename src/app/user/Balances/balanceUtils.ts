import { GetAddressTokenResult, TokenBalance } from '@/app/user/types'
import { tokenContracts } from '@/lib/contracts'
import { formatEther } from 'viem'

const symbolsToGetFromArray = {
  RIF: { equivalentSymbols: ['tRIF', 'RIF'], currentContract: tokenContracts.RIF },
  RBTC: { equivalentSymbols: ['RBTC', 'tRBTC'], currentContract: tokenContracts.RBTC },
  stRIF: { equivalentSymbols: ['stRIF', 'FIRts'], currentContract: tokenContracts.stRIF },
}

export type SymbolsEquivalentKeys = keyof typeof symbolsToGetFromArray

export const getTokenBalance = (
  symbol: SymbolsEquivalentKeys,
  arrayToSearch?: GetAddressTokenResult,
): TokenBalance => {
  const { equivalentSymbols, currentContract } = symbolsToGetFromArray[symbol]

  const resultToReturn = {
    balance: '0',
    symbol: symbol as string,
  }
  if (!Array.isArray(arrayToSearch)) {
    return resultToReturn
  }

  for (let equivalentSymbol of equivalentSymbols) {
    const tokenData = arrayToSearch.find(
      token =>
        token.symbol?.toLowerCase() === equivalentSymbol.toLowerCase() &&
        token.contractAddress.toLowerCase() === currentContract.toLowerCase(),
    )
    if (tokenData) {
      resultToReturn.balance = formatEther(BigInt(tokenData.balance))
      resultToReturn.symbol = tokenData.symbol
      return resultToReturn
    }
  }
  return resultToReturn
}
