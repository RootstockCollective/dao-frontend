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

  const { writeContractAsync, data } = useWriteContract()
  const { isLoading: isTxHashFromExecuteLoading } = useWaitForTransactionReceipt({ hash: data })

  const onExecuteProposal = async () => {
    if (proposalEta && getCurrentTimeInMsAsBigInt() >= proposalEta) {
      return writeContractAsync({
        // abi: [
        //   {
        //     inputs: [
        //       {
        //         internalType: 'uint256',
        //         name: 'proposalId',
        //         type: 'uint256',
        //       },
        //     ],
        //     name: 'execute',
        //     outputs: [],
        //     stateMutability: 'payable',
        //     type: 'function',
        //   },
        // ],
        ...DAO_DEFAULT_PARAMS,
        functionName: 'execute',
        args: [BigInt(proposalId)],
      }).catch(error => {
        // @TODO when there is an error, use decodeErrorResult to get the error
        // What is recommended is to iterate over each ABI and then see if any return result
        console.log(42, error)
        throw new Error(error)
      })
    }
  }

  const proposalEtaHumanDate = getBigIntTimestampAsHuman(proposalEta)
  return {
    onExecuteProposal,
    canProposalBeExecuted: proposalEta && currentTime >= proposalEta,
    proposalEta,
    proposalEtaHumanDate,
    isTxHashFromExecuteLoading,
  }
}
