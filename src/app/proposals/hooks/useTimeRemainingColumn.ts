import { useMemo } from 'react'
import { useBlockNumber, useReadContracts } from 'wagmi'
import { type LatestProposalResponse } from './useFetchLatestProposals'
import { governor } from '@/lib/contracts'
import { DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK } from '@/lib/constants'

interface Props {
  proposals?: LatestProposalResponse[]
}

const convertToTimeRemaining = (seconds: number) => {
  const days = Math.floor(seconds / (24 * 60 * 60)) // Number of days
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60)) // Remaining hours
  const minutes = Math.floor((seconds % (60 * 60)) / 60) // Remaining minutes
  const remainingSeconds = Math.floor(seconds % 60) // Remaining seconds

  return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`
}

// Determine the text color based on the ratio
const getColorClass = (ratio: number): string => {
  if (ratio > 0.66) {
    return 'text-st-success'
  } else if (ratio > 0.33 && ratio <= 0.66) {
    return 'text-st-info'
  } else {
    return 'text-st-error'
  }
}

/**
 * Get data for Time Remaining column in Proposals table
 */
export function useTimeRemainingColumn({ proposals }: Props) {
  const { data: latestBlockNumber } = useBlockNumber()

  const { data: proposalDeadLines } = useReadContracts({
    contracts: proposals?.map(proposal => ({
      ...governor,
      functionName: 'proposalDeadline',
      args: [BigInt(proposal.args.proposalId)],
    })),
  }) as { data?: Array<{ result: string }> }

  return useMemo(
    () =>
      proposals?.map((proposal, i) => {
        const deadlineBlock = BigInt(proposalDeadLines?.[i]?.result ?? 0n)
        const blocksUntilClosure = BigInt(deadlineBlock ?? 1n) - BigInt(latestBlockNumber ?? 1n)
        const creationBlock = BigInt(proposal.blockNumber)
        const votingPeriod = (deadlineBlock ?? 1n) - creationBlock
        const ratio = Number(blocksUntilClosure) / Number(votingPeriod)
        const colorClass = getColorClass(ratio)
        const timeRemainingSec = Number(blocksUntilClosure) * DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK
        const timeRemainingMsg = blocksUntilClosure > 0n ? convertToTimeRemaining(timeRemainingSec) : '-'
        return {
          time: {
            colorClass,
            timeRemainingMsg,
            timeRemainingSec,
          },
        }
      }) ?? [],
    [latestBlockNumber, proposalDeadLines, proposals],
  )
}
