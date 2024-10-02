import { useProposalContext } from '@/app/proposals/ProposalsContext'
import { toFixed } from '@/lib/utils'
import { useReadContract } from 'wagmi'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GOVERNOR_ADDRESS } from '@/lib/constants'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'

export const VotesColumn = () => {
  const { proposalVotes, blockNumber } = useProposalContext()
  const votes = proposalVotes.reduce((prev, next) => Number(next) + prev, 0)

  const { data: quorumAtSnapshot } = useReadContract({
    abi: GovernorAbi,
    address: GOVERNOR_ADDRESS,
    functionName: 'quorum',
    args: [BigInt(blockNumber)],
  })
  let quorum = '-'
  let percentage = 0

  if (quorumAtSnapshot) {
    quorum = formatBalanceToHuman(quorumAtSnapshot)
    // Calculate percentage of votes relative to quorum
    percentage = (votes / Number(quorum)) * 100
  }

  // Determine the color based on percentage
  let colorClass = 'text-st-error' // Default to RED (0-49%)
  if (percentage >= 100) {
    colorClass = 'text-st-success'
  } else if (percentage >= 50) {
    colorClass = 'text-st-info'
  }
  return (
    <>
      <p className={colorClass}>
        {toFixed(votes)} ({percentage.toFixed(2)}%)
      </p>
      <p>Quorum: {Math.floor(Number(quorum))}</p>
    </>
  )
}
