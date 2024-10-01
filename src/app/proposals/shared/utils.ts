import moment from 'moment'
import { Address, decodeFunctionData, DecodeFunctionDataReturnType, Hash } from 'viem'
import {
  SupportedActionAbi,
  abis,
  FunctionEntry,
  FunctionInputs,
  SupportedProposalActionName,
} from '@/app/proposals/shared/supportedABIs'

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
}

type DecodedFunctionData = DecodeFunctionDataReturnType<SupportedActionAbi>

export type DecodedData = {
  functionName: DecodedFunctionData['functionName'] & SupportedProposalActionName
  args: DecodedFunctionData['args']
  inputs: FunctionInputs
}

const tryDecode = (data: string): DecodedData => {
  for (const abi of abis) {
    try {
      const { functionName, args } = decodeFunctionData({ data: data as Hash, abi })

      const functionDefinition =
        abi.find(item => 'name' in item && item.name === functionName) || ({} as FunctionEntry)

      return {
        functionName: functionName as SupportedProposalActionName,
        args,
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
 */
export const getEventArguments = ({
  args: { description, proposalId, proposer, calldatas },
  timeStamp,
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
  }
}
