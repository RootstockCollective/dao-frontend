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

/**
 * This helps to render the right hook due to how Wagmi works...
 * If the status is not active, there is no point in fetching the status of the vote
 */
const dummyHook = () => ({
  blocksUntilClosure: 0,
  proposalDeadlineBlock: undefined,
})

const useProposalDeadline = (proposalId: string, latestBlockNumber: bigint, proposalStateHuman: string) => {
  const hookToUse = proposalStateHuman === 'Active' ? useGetProposalDeadline : dummyHook
  return hookToUse(proposalId, latestBlockNumber)
}

export const TimeRemainingColumn = () => {
  const { latestBlockNumber } = useSharedProposalsTableContext()
  const { proposalId, blockNumber, proposalStateHuman } = useProposalContext()
  const { blocksUntilClosure = 0n, proposalDeadlineBlock } = useProposalDeadline(
    proposalId,
    latestBlockNumber || BigInt(1),
    proposalStateHuman,
  )

  const votingWindowBlocks = BigInt(proposalDeadlineBlock || 1) - BigInt(blockNumber)
  const ratio = Number(blocksUntilClosure) / Number(votingWindowBlocks)

  let colorClass = ''
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
