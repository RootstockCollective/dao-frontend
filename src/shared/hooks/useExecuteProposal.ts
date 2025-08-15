import { useMemo } from 'react'
import { useReadContract, useWriteContract } from 'wagmi'
import { GovernorAddress } from '@/lib/contracts'
import { GovernorAbi } from '@/lib/abis/Governor'
import { TimelockControllerAbi } from '@/lib/abis/TimelockController'
import Big from '@/lib/big'

const DAO_DEFAULT_PARAMS = {
  abi: GovernorAbi,
  address: GovernorAddress,
}

const getCurrentTimeInMsAsBigInt = () => BigInt(Math.floor(Date.now() / 1000))

const getBigIntTimestampAsHuman = (proposalEta?: bigint) => {
  if (!proposalEta) return ''
  const proposalEtaMs = Big(proposalEta.toString()).mul(1000).toNumber()
  const proposalDate = new Date(proposalEtaMs)
  return proposalDate.toLocaleString()
}

export const useExecuteProposal = (proposalId: string) => {
  const { data: proposalEta } = useReadContract({
    ...DAO_DEFAULT_PARAMS,
    functionName: 'proposalEta',
    args: [BigInt(proposalId)],
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
      staleTime: 1000,
    },
  })

  const { data: timelockAddress } = useReadContract({
    ...DAO_DEFAULT_PARAMS,
    functionName: 'timelock',
  })

  const { data: minDelay } = useReadContract({
    abi: TimelockControllerAbi,
    address: timelockAddress,
    functionName: 'getMinDelay',
    query: {
      enabled: !!timelockAddress,
      staleTime: 60000, // Timelock delay rarely changes
    },
  })

  const { writeContractAsync: execute, isPending: isPendingExecution } = useWriteContract()

  // Memoized calculations
  const proposalQueuedTime = useMemo(() => {
    if (!proposalEta || !minDelay) return undefined
    return Big(proposalEta.toString()).minus(minDelay.toString())
  }, [proposalEta, minDelay])

  const canProposalBeExecuted = proposalEta ? getCurrentTimeInMsAsBigInt() >= proposalEta : false

  const onExecuteProposal = () => {
    return execute({
      ...DAO_DEFAULT_PARAMS,
      functionName: 'execute',
      args: [BigInt(proposalId)],
    })
  }

  const proposalEtaHumanDate = getBigIntTimestampAsHuman(proposalEta)

  return {
    onExecuteProposal,
    canProposalBeExecuted,
    proposalEta: proposalEta ? Big(proposalEta.toString() || 0) : undefined,
    proposalEtaHumanDate,
    proposalQueuedTime,
    isPendingExecution,
  }
}
