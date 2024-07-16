import { BigNumberish, ethers } from 'ethers'
import { GetAddressTokenResult, TokenBalance } from '@/app/user/types'
import { currentEnvContracts } from '@/lib/contracts'

export const formatBalanceToHuman = (balance: BigNumberish, decimal = 18) =>
  ethers.formatUnits(balance, decimal)

const symbolsToGetFromArray = {
  RIF: { equivalentSymbols: ['tRIF', 'RIF'], currentContract: currentEnvContracts.RIF },
  rBTC: { equivalentSymbols: ['rBTC'], currentContract: currentEnvContracts.rBTC },
  stRIF: { equivalentSymbols: ['stRIF'], currentContract: currentEnvContracts.stRIF },
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
        token.symbol.toLowerCase() === equivalentSymbol.toLowerCase() &&
        token.contractAddress.toLowerCase() === currentContract.toLowerCase(),
    )
    if (tokenData) {
      resultToReturn.balance = formatBalanceToHuman(tokenData.balance)
      resultToReturn.symbol = tokenData.symbol
      return resultToReturn
    }
  }
  return resultToReturn
}
