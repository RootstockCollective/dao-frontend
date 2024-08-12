import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { decodeFunctionData, Hash } from 'viem'

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

const decodeERC20FunctionData = (data: `0x${string}`) =>
  decodeFunctionData({
    abi: RIFTokenAbi,
    data,
  })

export const getEventArguments = ({
  args: { description, proposalId, proposer, calldatas },
  timeStamp,
}: EventArgumentsParameter) => {
  // Parse transfer event from calldata[0]
  const erc20CallData = calldatas[0]
  let transferTo, transferToValue
  if (erc20CallData) {
    const decodedFunctionData = decodeERC20FunctionData(erc20CallData as Hash)
    if (decodedFunctionData?.functionName === 'transfer') {
      transferTo = decodedFunctionData.args[0]
      transferToValue = decodedFunctionData.args[1]
    }
  }
  return {
    name: description.split(';')[0],
    proposer,
    description: description.split(';')[1],
    proposalId: proposalId.toString(),
    Starts: new Date(parseInt(timeStamp, 16) * 1000).toISOString().split('T')[0],
    transferTo,
    transferToValue,
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
} as const
