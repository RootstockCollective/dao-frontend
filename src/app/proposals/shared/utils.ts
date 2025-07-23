import moment from 'moment'
import { Address, checksumAddress, decodeFunctionData, DecodeFunctionDataReturnType, Hash } from 'viem'
import {
  SupportedActionAbi,
  abis,
  FunctionEntry,
  FunctionInputs,
  SupportedProposalActionName,
} from '@/app/proposals/shared/supportedABIs'
import { GovernorAbi } from '@/lib/abis/Governor'
import { formatEther, zeroAddress } from 'viem'
import { MAX_NAME_LENGTH_FOR_PROPOSAL, RIF_ADDRESS, TALLY_DESCRIPTION_SEPARATOR } from '@/lib/constants'

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

// Separate types for successful decode and fallback
type DecodedSuccessData = {
  type: 'decoded'
  functionName: DecodedFunctionData['functionName'] & SupportedProposalActionName
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

export const actionFormatterMap = {
  token: (tokenAddress: Address) =>
    ({
      [zeroAddress]: 'RBTC',
      [RIF_ADDRESS.toLowerCase()]: 'RIF',
    })[tokenAddress.toLowerCase()] || tokenAddress.toString(),
  to: (address: Address) => address.toString(),
  amount: (amount: bigint) => formatEther(amount),
}

export const DISPLAY_NAME_SEPARATOR = 'D15PL4Y_N4M3:'
export const splitCombinedName = (name: string) => {
  const [proposalName, builderName] = name.split(DISPLAY_NAME_SEPARATOR)
  return { proposalName, builderName }
}

// each parameter uses 32 bytes in the calldata but we only need the address which is 20 bytes
export const ADDRESS_PADDING_LENGTH = 24

export const RELAY_PARAMETER_PADDING_LENGTH = 256

export const isAddressRegex = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)

export const isChecksumValid = (value: string, chainId?: string) => {
  return (
    value === value.toLowerCase() ||
    checksumAddress(value as Address, chainId ? Number(chainId) : undefined) === value
  )
}

type ProposalSource = 'DAO' | 'TALLY' | 'UNKNOWN'
interface ParsedDescription {
  name: string
  description: string
  source: ProposalSource
  fullProposalName?: string // Used to parse builder name
}

const parseProposalDescription = (description: string): ParsedDescription => {
  // Default result
  let result: ParsedDescription = {
    name: '',
    description: description,
    source: 'UNKNOWN',
  }

  // If the proposal description contains semicolon, we will automatically assume it's ours (for now)
  if (description.includes(';')) {
    const [name, ...rest] = description.split(';')
    return {
      name: name.substring(0, MAX_NAME_LENGTH_FOR_PROPOSAL),
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
