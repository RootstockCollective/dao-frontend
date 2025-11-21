import { Address } from 'viem'
import { DecodedData } from './utils'
import { tokenContracts } from '@/lib/contracts'
import { RIF, RBTC, USDRIF, RIF_ADDRESS, USDRIF_ADDRESS, ENV, TRIF } from '@/lib/constants'

/**
 * Maps token addresses to their symbols
 * Used across the proposal flow for consistent token symbol resolution
 */
export const getTokenSymbolFromAddress = (tokenAddress: Address | string | null): string => {
  if (!tokenAddress) return RBTC // null means rBTC

  const normalizedAddress = tokenAddress.toLowerCase()

  if (
    normalizedAddress === tokenContracts[RIF].toLowerCase() ||
    normalizedAddress === RIF_ADDRESS.toLowerCase()
  ) {
    return ENV === 'testnet' ? TRIF : RIF
  }

  if (
    normalizedAddress === tokenContracts[USDRIF].toLowerCase() ||
    normalizedAddress === USDRIF_ADDRESS.toLowerCase()
  ) {
    return USDRIF
  }

  return 'UNKNOWN'
}

export interface TreasuryTransferInfo {
  tokenAddress: Address | null // null means rBTC
  amount: bigint
  tokenSymbol: string
}

/**
 * Extracts treasury transfer information from decoded proposal calldata
 * Returns null if the calldata is not a treasury withdrawal
 *
 * This function is used to extract transfer details for treasury fund checks
 * and proposal action parsing.
 */
export const extractTreasuryTransferInfo = (decodedData: DecodedData): TreasuryTransferInfo | null => {
  if (decodedData.type !== 'decoded') {
    return null
  }

  const { functionName, args } = decodedData

  if (functionName === 'withdraw') {
    // withdraw(address payable to, uint256 amount)
    // This is for rBTC
    const amount = typeof args[1] === 'bigint' ? args[1] : BigInt(args[1]?.toString() || '0')
    return {
      tokenAddress: null, // null means rBTC
      amount,
      tokenSymbol: RBTC,
    }
  }

  if (functionName === 'withdrawERC20') {
    // withdrawERC20(address token, address to, uint256 amount)
    const tokenAddress = typeof args[0] === 'string' ? (args[0] as Address) : null
    const amount = typeof args[2] === 'bigint' ? args[2] : BigInt(args[2]?.toString() || '0')

    if (!tokenAddress) {
      return null
    }

    return {
      tokenAddress,
      amount,
      tokenSymbol: getTokenSymbolFromAddress(tokenAddress),
    }
  }

  return null
}
