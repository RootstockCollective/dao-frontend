import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { Address, decodeFunctionData, Hash } from 'viem'
import { DAOTreasuryAbi } from '@/lib/abis/DAOTreasuryAbi'

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

const abis = [DAOTreasuryAbi, RIFTokenAbi]

const tryDecode = (data: string) => {
  for (const abi of abis) {
    try {
      const { functionName, args } = decodeFunctionData({ data: data as Hash, abi })
      const functionDefinition = abi.find(item => 'name' in item && item.name === functionName) || {}
      return {
        functionName,
        args,
        inputs: 'inputs' in functionDefinition ? functionDefinition.inputs : [],
      }
    } catch (_) {
      continue
    }
  }
  throw new Error('No ABI found to decode this proposal data.')
}

export const getEventArguments = ({
  args: { description, proposalId, proposer, calldatas },
  timeStamp,
}: EventArgumentsParameter) => {
  const calldatasParsed = calldatas.map(tryDecode)
  return {
    name: description.split(';')[0],
    proposer,
    description: description.split(';')[1],
    proposalId: proposalId.toString(),
    Starts: new Date(parseInt(timeStamp, 16) * 1000).toISOString().split('T')[0],
    calldatasParsed,
  }
}
