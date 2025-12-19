import moment from 'moment'
import { Address, decodeFunctionData, DecodeFunctionDataReturnType, Hash } from 'viem'
import {
  SupportedActionAbi,
  abis,
  FunctionEntry,
  FunctionInputs,
  SupportedProposalActionName,
} from '@/app/proposals/shared/supportedABIs'
import { GovernorAbi } from '@/lib/abis/Governor'
import { MAX_NAME_LENGTH_FOR_PROPOSAL, TALLY_DESCRIPTION_SEPARATOR } from '@/lib/constants'
import { ProposalCategory } from '@/shared/types'
import { Milestones } from './types'
import Big from '@/lib/big'

export interface EventArgumentsParameter {
  args: {
    description: string
    proposalId: bigint
    voteStart: bigint
    voteEnd: bigint
    proposer: Address
    targets: string[]
    values: bigint[]
    calldatas: string[]
  }
  timeStamp: string
  blockNumber: string
}

type DecodedFunctionData = DecodeFunctionDataReturnType<SupportedActionAbi>

export type DecodedFunctionName = DecodedFunctionData['functionName'] & SupportedProposalActionName

// Separate types for successful decode and fallback
type DecodedSuccessData = {
  type: 'decoded'
  functionName: DecodedFunctionName
  args: DecodedFunctionData['args']
  inputs: FunctionInputs
}

type DecodedFallbackData = {
  type: 'fallback'
  affectedAddress: string
  callData: string
  value: bigint
}

// Union type for all possible cases
export type DecodedData = DecodedSuccessData | DecodedFallbackData

const tryDecode = (data: string): DecodedData | undefined => {
  for (const abi of [...abis, GovernorAbi]) {
    try {
      const { functionName, args } = decodeFunctionData({ data: data as Hash, abi })

      if (functionName === 'relay') {
        return tryDecode(args[2])
      }

      const functionDefinition =
        abi.find(item => 'name' in item && item.name === functionName) || ({} as FunctionEntry)

      return {
        type: 'decoded',
        functionName: functionName as SupportedProposalActionName,
        args: args as DecodedFunctionData['args'],
        inputs: ('inputs' in functionDefinition ? functionDefinition.inputs : []) as FunctionInputs,
      }
    } catch (_) {
      continue
    }
  }

  return undefined
}
/**
 * Function to parse proposal data into usable data
 * Note: Do not edit anything from this. This is being used across the app.
 * If you have to edit it, be sure that you track all usages and replace accordingly.
 * @param description
 * @param proposalId
 * @param proposer
 * @param targets
 * @param calldatas
 * @param timeStamp
 * @param blockNumber
 */
export const getProposalEventArguments = ({
  args: { description, proposalId, proposer, targets, calldatas, values },
  timeStamp,
  blockNumber,
}: EventArgumentsParameter) => {
  const { name, description: parsedDescription, fullProposalName } = parseProposalDescription(description)

  const calldatasParsed = calldatas.reduce<DecodedData[]>((acc, cd, index) => {
    try {
      const decodedData = tryDecode(cd)
      if (decodedData) {
        acc.push(decodedData)
      } else {
        const affectedAddress = targets[index]
        const value = values[index] || 0n
        acc.push({
          affectedAddress,
          callData: cd,
          type: 'fallback',
          value,
        })
      }
    } catch (err) {
      // TODO:: decide whether it is necessary to throw error (if so then also perhaps the function name `tryDecode` is misleading).
      // Only logging this error due to the fact that anyone can submit any proposal directly via contract call.
      console.error(err)
      console.error('🐛 proposer:', proposer)
      console.error('🐛 proposalId:', proposalId)
      console.error('🐛 description:', description)
      console.error('🐛 calldatas:', calldatas)
    }

    return acc
  }, [])

  return {
    name: name,
    proposer,
    description: parsedDescription,
    proposalId: proposalId.toString(),
    Starts: timeStamp.startsWith('0x')
      ? moment(parseInt(timeStamp, 16) * 1000)
      : moment.unix(parseInt(timeStamp)),
    calldatasParsed,
    blockNumber,
    fullProposalName,
  }
}

export const DISPLAY_NAME_SEPARATOR = 'D15PL4Y_N4M3:'
export const DISCOURSE_LINK_SEPARATOR = 'DiscourseLink:'
export const MILESTONE_SEPARATOR = 'M1lestone:'
export const NO_MILESTONE = 'No milestone'

export const labeledMilestones = [
  {
    value: Milestones.NO_MILESTONE,
    label: NO_MILESTONE,
  },
  {
    value: Milestones.MILESTONE_1,
    label: ProposalCategory.Milestone1,
  },
  {
    value: Milestones.MILESTONE_2,
    label: ProposalCategory.Milestone2,
  },
  {
    value: Milestones.MILESTONE_3,
    label: ProposalCategory.Milestone3,
  },
]

export const splitCombinedName = (name: string) => {
  const [proposalName, builderName] = name.split(DISPLAY_NAME_SEPARATOR)
  return { proposalName, builderName }
}

export const getDiscourseLinkFromProposalDescription = (description: string): string | undefined => {
  const startIndex = description.indexOf(DISCOURSE_LINK_SEPARATOR)

  if (startIndex === -1) {
    return undefined
  }

  const afterLink = startIndex + DISCOURSE_LINK_SEPARATOR.length

  // Find the first space after DiscourseLink: separator
  const firstSpaceIndex = description.indexOf(' ', afterLink)

  if (firstSpaceIndex === -1) {
    // If there's no space after DiscourseLink:, take everything to the end
    return description.substring(afterLink).trim()
  }

  // Extract everything from after DiscourseLink: up to (but not including) the first space
  return description.substring(afterLink, firstSpaceIndex).trim()
}

// each parameter uses 32 bytes in the calldata but we only need the address which is 20 bytes
export const ADDRESS_PADDING_LENGTH = 24

export const RELAY_PARAMETER_PADDING_LENGTH = 256

type ProposalSource = 'DAO' | 'TALLY' | 'UNKNOWN'
interface ParsedDescription {
  name: string
  description: string
  source: ProposalSource
  fullProposalName?: string // Used to parse builder name
}

export const parseProposalDescription = (description: string): ParsedDescription => {
  // If the proposal description contains semicolon, we will automatically assume it's ours (for now)
  if (description.includes(';')) {
    const [name, ...rest] = description.split(';')
    const { proposalName } = splitCombinedName(name)
    return {
      name: proposalName.substring(0, MAX_NAME_LENGTH_FOR_PROPOSAL),
      description: rest.join(';').trim(),
      source: 'DAO',
      fullProposalName: name,
    }
  }

  // Check if it's from Tally (contains double spaces)
  if (description.includes(TALLY_DESCRIPTION_SEPARATOR)) {
    // Extract first line or sentence as name
    const firstLineBreak = description.indexOf('\n')
    const firstPeriod = description.indexOf('.')
    const nameEndIndex = Math.min(
      firstLineBreak > -1 ? firstLineBreak : Infinity,
      firstPeriod > -1 ? firstPeriod : Infinity,
    )

    return {
      name: description.substring(0, nameEndIndex).substring(0, MAX_NAME_LENGTH_FOR_PROPOSAL),
      description: description,
      source: 'TALLY',
      fullProposalName: description.substring(0, nameEndIndex),
    }
  }

  // Unknown source - use first N chars as name
  return {
    name: description.substring(0, MAX_NAME_LENGTH_FOR_PROPOSAL),
    description: description,
    source: 'UNKNOWN',
    fullProposalName: description,
  }
}

// Helper function to determine proposal category
export function getProposalCategory(calldatasParsed: DecodedData[]): ProposalCategory {
  const hasWithdrawAction = calldatasParsed
    .filter((data): data is Extract<DecodedData, { type: 'decoded' }> => data.type === 'decoded')
    .find(data => ['withdraw', 'withdrawERC20'].includes(data.functionName))

  return hasWithdrawAction ? ProposalCategory.Grants : ProposalCategory.Activation
}

/**
 * Extracts proposal category from parsed calldata and description
 * @param calldatasParsed - Array of decoded calldata
 * @param description - Original proposal description for milestone detection
 * @returns ProposalCategory
 */
export function getProposalCategoryFromParsedData(
  calldatasParsed: DecodedData[],
  description: string,
): ProposalCategory {
  // Extract all decoded function names once
  const decodedFunctionNames = calldatasParsed
    .filter(data => data.type === 'decoded')
    .map(data => data.functionName)

  // Map function names to their categories
  const functionCategoryMap = new Map<string, ProposalCategory>([
    ['communityApproveBuilder', ProposalCategory.Activation],
    ['whitelistBuilder', ProposalCategory.Activation],
    ['communityBanBuilder', ProposalCategory.Deactivation],
    ['removeWhitelistedBuilder', ProposalCategory.Deactivation],
  ])

  // Check for builder functions first
  for (const functionName of decodedFunctionNames) {
    const category = functionCategoryMap.get(functionName)
    if (category) {
      return category
    }
  }

  // Then check for milestone (only if not a builder function)
  const milestoneRegex = new RegExp(`${MILESTONE_SEPARATOR}(\\S+)`, 'i')
  const milestoneMatch = description.match(milestoneRegex)

  if (milestoneMatch) {
    const milestoneNumber = milestoneMatch[1]
    switch (milestoneNumber) {
      case Milestones.MILESTONE_1:
        return ProposalCategory.Milestone1
      case Milestones.MILESTONE_2:
        return ProposalCategory.Milestone2
      case Milestones.MILESTONE_3:
        return ProposalCategory.Milestone3
    }
  }

  // If not builder functions and not milestone, it must be a grant
  return ProposalCategory.Grants
}

// Type utility to serialize bigint values to strings recursively
export type SerializeBigInt<T> = T extends bigint
  ? string
  : T extends (infer U)[]
    ? SerializeBigInt<U>[]
    : T extends object
      ? { [K in keyof T]: SerializeBigInt<T[K]> }
      : T

// Serialized version of DecodedData (explicit type for our use case)
export type SerializedDecodedData =
  | {
      type: 'decoded'
      functionName: DecodedFunctionName
      args: SerializeBigInt<DecodedFunctionData['args']>
      inputs: FunctionInputs
    }
  | {
      type: 'fallback'
      affectedAddress: string
      callData: string
      value: string
    }

/**
 * Recursively converts bigint values to strings in an object/array.
 * Helper function for the recursive transformation.
 */
function serializeValue(value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString()
  }
  if (Array.isArray(value)) {
    return value.map(serializeValue)
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = serializeValue((value as Record<string, unknown>)[key])
      }
    }
    return result
  }
  return value
}

/**
 * Converts DecodedData array to SerializedDecodedData array by converting bigints to strings.
 * This is a simpler, explicit version for our specific use case.
 */
export function serializeBigInts(calldatasParsed: DecodedData[]): SerializedDecodedData[] {
  return calldatasParsed.map(item => {
    if (item.type === 'decoded') {
      return {
        type: 'decoded' as const,
        functionName: item.functionName,
        args: serializeValue(item.args) as SerializeBigInt<DecodedFunctionData['args']>,
        inputs: item.inputs,
      }
    }
    // Fallback case - serialize the bigint value
    return {
      type: 'fallback' as const,
      affectedAddress: item.affectedAddress,
      callData: item.callData,
      value: item.value.toString(),
    }
  })
}

export function formatTimestampToMonthYear(timestamp: string | undefined): string {
  if (!timestamp) return ' - '
  const date = new Date(Number(timestamp) * 1000) // seconds → ms
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

// Utility function to safely convert amount to bigint
export function convertAmountToBigint(amount: bigint | string | undefined): bigint {
  if (!amount) return 0n

  if (typeof amount === 'bigint') {
    return amount
  }

  if (typeof amount === 'string') {
    // Handle string input - convert to bigint
    // Remove commas and any other non-numeric characters except decimal point
    const cleanAmount = amount.replace(/,/g, '').replace(/[^\d.]/g, '')
    if (!cleanAmount || cleanAmount === '.') return 0n

    // Convert to wei (assuming 18 decimals) and then to bigint
    const numericAmount = parseFloat(cleanAmount)
    if (isNaN(numericAmount)) return 0n

    // Convert to wei (multiply by 10^18) and then to bigint
    const weiAmount = Big(numericAmount).times(Big(10).pow(18))
    // Use toFixed to avoid scientific notation, then convert to BigInt
    return BigInt(weiAmount.toFixed(0))
  }

  return 0n
}
