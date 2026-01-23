import { Address, decodeFunctionData, DecodeFunctionDataReturnType, Hash } from 'viem'
import { DAOTreasuryAbi } from '@/lib/abis/DAOTreasuryAbi'
import { treasuryContracts } from '@/lib/contracts'
import { extractTreasuryTransferInfo, TreasuryTransferInfo } from '@/app/proposals/shared/treasuryUtils'
import { DecodedData } from '@/app/proposals/shared/utils'
import { SupportedProposalActionName } from '@/app/proposals/shared/supportedABIs'

/**
 * Checks if an address is a treasury contract
 * Uses the treasuryContracts mapping from contracts.ts
 */
export const isTreasuryContract = (address: Address): boolean => {
  return Object.values(treasuryContracts).some(
    contract => contract.address.toLowerCase() === address.toLowerCase(),
  )
}

type TreasuryDecodedData = DecodeFunctionDataReturnType<typeof DAOTreasuryAbi>

// Treasury functions that are supported for transfer extraction
const _TREASURY_TRANSFER_FUNCTIONS = ['withdraw', 'withdrawERC20'] as const
type TreasuryTransferFunctionName = (typeof _TREASURY_TRANSFER_FUNCTIONS)[number]

/**
 * Type guard to check if a function name is a supported treasury transfer function
 */
function isTreasuryTransferFunction(
  functionName: string,
): functionName is TreasuryTransferFunctionName & SupportedProposalActionName {
  return functionName === 'withdraw' || functionName === 'withdrawERC20'
}

/**
 * Decodes calldata and extracts treasury transfer information
 * Uses decodeFunctionData with DAOTreasuryAbi to decode, then extracts transfer info
 * using the shared extractTreasuryTransferInfo function
 */
export const decodeTreasuryTransfer = (calldata: string): TreasuryTransferInfo | null => {
  try {
    const decoded: TreasuryDecodedData = decodeFunctionData({
      data: calldata as Hash,
      abi: DAOTreasuryAbi,
    })

    // Only process treasury transfer functions
    if (!isTreasuryTransferFunction(decoded.functionName)) {
      return null
    }

    // After the type guard, functionName is narrowed to TreasuryTransferFunctionName & SupportedProposalActionName
    // Since both 'withdraw' and 'withdrawERC20' are in SupportedProposalActionName,
    // we need to assert to DecodedFunctionName which is DecodedFunctionData['functionName'] & SupportedProposalActionName
    // This is safe because these functions exist in DAOTreasuryAbi which is part of SupportedActionAbi
    const functionName = decoded.functionName as SupportedProposalActionName

    // Convert to DecodedData format for extractTreasuryTransferInfo
    const decodedData: DecodedData = {
      type: 'decoded',
      functionName,
      args: decoded.args,
      inputs: [],
    }

    // Use the shared extractTreasuryTransferInfo function
    return extractTreasuryTransferInfo(decodedData)
  } catch (_error) {
    // If decoding fails, it's not a treasury function we recognize
    return null
  }
}

// Re-export for convenience
export type { TreasuryTransferInfo } from '@/app/proposals/shared/treasuryUtils'
