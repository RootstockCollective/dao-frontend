import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { decodeFunctionData, Hash } from 'viem'
import { DAOTreasuryAbi } from '@/lib/abis/DAOTreasuryAbi'

export interface EventArgumentsParameter {
  args: {
    description: string
    proposalId: bigint
    voteStart: bigint
    voteEnd: bigint
    proposer: string
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

export const TRANSACTION_SENT_MESSAGES = {
  error: {
    title: 'Error publishing',
    content:
      'Error publishing. An unexpected error occurred while trying to publish your proposal. Please try again later. If the issue persists, contact support for assistance.',
    severity: 'error',
  },
  pending: {
    title: 'Transaction sent',
    content:
      'Proposal transaction sent. Your proposal is in process. It will be visible when the transaction is confirmed.',
    severity: 'info',
  },
  success: {
    title: 'Proposal successfully created',
    content:
      'Proposal successfully created. Your proposal has been published successfully! It is now visible to the community for review and feedback. Thank you for your contribution.',
    severity: 'success',
  },
  canceled: {
    title: 'Transaction canceled',
    content: 'You canceled the transaction.',
    severity: 'warning',
  },
} as const

export const STAKING_MESSAGES = {
  error: {
    title: 'Error staking',
    content:
      'Error staking. An unexpected error occurred while trying to stake. Please try again later. If the issue persists, contact support for assistance.',
    severity: 'error',
  },
  pending: {
    title: 'Staking in process',
    content: 'Your transaction is in progress. It will be visible when the transaction is confirmed.',
    severity: 'info',
  },
} as const
