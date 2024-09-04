import { GovernorAddress } from '@/lib/contracts'
import { GovernorAbi } from '@/lib/abis/Governor'
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

const DAO_DEFAULT_PARAMS = {
  abi: GovernorAbi,
  address: GovernorAddress,
}

const getCurrentTimeInMsAsBigInt = () => BigInt(Math.floor(Date.now() / 1000))

const getBigIntTimestampAsHuman = (proposalEta?: bigint) => {
  if (!proposalEta) return ''
  const proposalEtaMs = Number(proposalEta) * 1000
  const proposalDate = new Date(proposalEtaMs)
  return proposalDate.toLocaleString()
}

export const useExecuteProposal = (proposalId: string) => {
  const { data: proposalEta } = useReadContract({
    ...DAO_DEFAULT_PARAMS,
    functionName: 'proposalEta',
    args: [BigInt(proposalId)],
    query: {
      refetchInterval: 5000,
    },
  })
  const currentTime = getCurrentTimeInMsAsBigInt()

  const { writeContractAsync: execute, data } = useWriteContract()
  const { isLoading: isExecuting } = useWaitForTransactionReceipt({ hash: data })

  const onExecuteProposal = () => {
    if (proposalEta && getCurrentTimeInMsAsBigInt() >= proposalEta) {
      return execute({
        ...DAO_DEFAULT_PARAMS,
        functionName: 'execute',
        args: [BigInt(proposalId)],
      })
    }
    return null
  }

  const proposalEtaHumanDate = getBigIntTimestampAsHuman(proposalEta)
  return {
    onExecuteProposal,
    canProposalBeExecuted: proposalEta && currentTime >= proposalEta,
    proposalEta,
    proposalEtaHumanDate,
    isExecuting,
  }
}
