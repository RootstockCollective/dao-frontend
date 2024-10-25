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
import { ZeroAddress } from 'ethers'
import { RIF_ADDRESS } from '@/lib/constants'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'

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

export type DecodedData = {
  functionName: DecodedFunctionData['functionName'] & SupportedProposalActionName
  args: DecodedFunctionData['args']
  inputs: FunctionInputs
}

const tryDecode = (data: string): DecodedData => {
  for (const abi of [...abis, GovernorAbi]) {
    try {
      const { functionName, args } = decodeFunctionData({ data: data as Hash, abi })

      if (functionName === 'relay') {
        return tryDecode(args[2])
      }

      const functionDefinition =
        abi.find(item => 'name' in item && item.name === functionName) || ({} as FunctionEntry)

      return {
        functionName: functionName as SupportedProposalActionName,
        args: args as DecodedFunctionData['args'],
        inputs: ('inputs' in functionDefinition ? functionDefinition.inputs : []) as FunctionInputs,
      }
    } catch (_) {
      continue
    }
  }
  throw new Error('No ABI found to decode this proposal data.')
}
/**
 * Function to parse proposal data into usable data
 * Note: Do not edit anything from this. This is being used across the app.
 * If you have to edit it, be sure that you track all usages and replace accordingly.
 * @param description
 * @param proposalId
 * @param proposer
 * @param calldatas
 * @param timeStamp
 * @param blockNumber
 */
export const getEventArguments = ({
  args: { description, proposalId, proposer, calldatas },
  timeStamp,
  blockNumber,
}: EventArgumentsParameter) => {
  const calldatasParsed = calldatas.reduce<DecodedData[]>((acc, cd) => {
    try {
      const decodedData = tryDecode(cd)
      acc = [...acc, decodedData]
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
    name: description.split(';')[0],
    proposer,
    description: description.split(';')[1],
    proposalId: proposalId.toString(),
    Starts: moment(parseInt(timeStamp, 16) * 1000),
    calldatasParsed,
    blockNumber,
  }
}

export const actionFormatterMap = {
  token: (tokenAddress: Address) =>
    ({
      [ZeroAddress]: 'RBTC',
      [RIF_ADDRESS.toLowerCase()]: 'RIF',
    })[tokenAddress.toLowerCase()] || tokenAddress.toString(),
  to: (address: Address) => address.toString(),
  amount: (amount: bigint) => formatBalanceToHuman(amount),
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
