import { Address, decodeFunctionData } from 'viem'
import { DAOTreasuryAbi } from '@/lib/abis/DAOTreasuryAbi'
import { treasuryContracts } from '@/lib/contracts'
import { extractTreasuryTransferInfo, TreasuryTransferInfo } from '@/app/proposals/shared/treasuryUtils'
import { DecodedData } from '@/app/proposals/shared/utils'

/**
 * Checks if an address is a treasury contract
 * Uses the treasuryContracts mapping from contracts.ts
 */
export const isTreasuryContract = (address: Address): boolean => {
  return Object.values(treasuryContracts).some(
    contract => contract.address.toLowerCase() === address.toLowerCase(),
  )
}

/**
 * Decodes calldata and extracts treasury transfer information
 * Uses decodeFunctionData with DAOTreasuryAbi to decode, then extracts transfer info
 * using the shared extractTreasuryTransferInfo function
 */
export const decodeTreasuryTransfer = (calldata: string): TreasuryTransferInfo | null => {
  try {
    const decoded = decodeFunctionData({
      data: calldata as `0x${string}`,
      abi: DAOTreasuryAbi,
    })

    // Convert to DecodedData format for extractTreasuryTransferInfo
    const decodedData: DecodedData = {
      type: 'decoded',
      functionName: decoded.functionName as any,
      args: decoded.args as any,
      inputs: [],
    }

    // Use the shared extractTreasuryTransferInfo function
    return extractTreasuryTransferInfo(decodedData)
  } catch (error) {
    // If decoding fails, it's not a treasury function we recognize
    return null
  }
}

// Re-export for convenience
export type { TreasuryTransferInfo } from '@/app/proposals/shared/treasuryUtils'
