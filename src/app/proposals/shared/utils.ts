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
import { MilestoneLabels, Milestones } from './types'

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
  args: { description, proposalId, proposer, targets, calldatas },
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
        acc.push({
          affectedAddress,
          callData: cd,
          type: 'fallback',
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

export const labeledMilestones = [
  {
    value: Milestones.MILESTONE_1,
    label: MilestoneLabels.FIRST,
  },
  {
    value: Milestones.MILESTONE_2,
    label: MilestoneLabels.SECOND,
  },
  {
    value: Milestones.MILESTONE_3,
    label: MilestoneLabels.THIRD,
  },
  {
    value: Milestones.NO_MILESTONE,
    label: MilestoneLabels.NO_MILESTONE,
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
  const lastSpaceIndex = description.lastIndexOf(' ')

  // If there's no space after the link, take everything to the end
  if (lastSpaceIndex <= afterLink) {
    return description.substring(afterLink).trim()
  }

  return description.substring(afterLink, lastSpaceIndex).trim()
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

const parseProposalDescription = (description: string): ParsedDescription => {
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
export function getProposalCategory(calldatasParsed: any[]): string {
  const hasWithdrawAction = calldatasParsed
    .filter(data => data.type === 'decoded')
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
    ['dewhitelistBuilder', ProposalCategory.Deactivation],
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

export function serializeBigInts(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString()
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInts)
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, serializeBigInts(value)]))
  }

  return obj
}
