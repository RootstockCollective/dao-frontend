import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { Address, decodeFunctionData, Hash } from 'viem'
import { DAOTreasuryAbi } from '@/lib/abis/DAOTreasuryAbi'
import { ZeroAddress } from 'ethers'
import { RIF_ADDRESS } from '@/lib/constants'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import moment from 'moment'

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

const abis = [DAOTreasuryAbi, RIFTokenAbi]

type DecodedData = {
  functionName: ReturnType<typeof decodeFunctionData>['functionName']
  args: ReturnType<typeof decodeFunctionData>['args']
  inputs: unknown | unknown[]
}

const tryDecode = (data: string): DecodedData => {
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
