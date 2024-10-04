import { useSharedProposalsTableContext } from '@/app/proposals/SharedProposalsTableContext'
import { useGetProposalDeadline } from '@/app/proposals/hooks/useGetProposalDeadline'
import { useProposalContext } from '@/app/proposals/ProposalsContext'

const DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK = 30

const convertToTimeRemaining = (seconds: number) => {
  const days = Math.floor(seconds / (24 * 60 * 60)) // Number of days
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60)) // Remaining hours
  const minutes = Math.floor((seconds % (60 * 60)) / 60) // Remaining minutes
  const remainingSeconds = Math.floor(seconds % 60) // Remaining seconds

  return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`
}

export const TimeRemainingColumn = () => {
  const { latestBlockNumber } = useSharedProposalsTableContext()
  const { proposalId, blockNumber } = useProposalContext()
  const { blocksUntilClosure, proposalDeadlineBlock } = useGetProposalDeadline(
    proposalId,
    latestBlockNumber || BigInt(1),
  )

  const votingWindowBlocks = BigInt(proposalDeadlineBlock || 1) - BigInt(blockNumber)
  const ratio = Number(blocksUntilClosure) / Number(votingWindowBlocks)

  let colorClass
  // Determine the text color based on the ratio
  if (ratio > 0.66) {
    colorClass = 'text-st-success'
  } else if (ratio > 0.33 && ratio <= 0.66) {
    colorClass = 'text-st-info'
  } else if (ratio > 0 && ratio <= 0.33) {
    colorClass = 'text-st-error'
  }

  return (
    <p className={colorClass}>
      {blocksUntilClosure
        ? convertToTimeRemaining(Number(blocksUntilClosure) * DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK)
        : '-'}
    </p>
  )
}
