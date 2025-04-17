import { formatNumberWithCommas } from '@/lib/utils'
import Big from '@/lib/big'

interface VotesColumnProps {
  forVotes: Big
  abstainVotes: Big
  quorumAtSnapshot: Big
}

export const VotesColumn = ({ forVotes, abstainVotes, quorumAtSnapshot }: VotesColumnProps) => {
  // Calculate the total votes considered for the quorum
  const quorumVotes = forVotes.add(abstainVotes)

  // Calculate the percentage relative to the quorumAtSnapshot
  // If quorumAtSnapshot is 0, percentage defaults to 0
  const percentage = quorumAtSnapshot.eq(0)
    ? Big(0)
    : quorumVotes.div(quorumAtSnapshot).mul(100).round(undefined, Big.roundHalfEven)

  // Determine the color class based on the percentage
  const colorClass = percentage.gte(100)
    ? 'text-st-success' // Green for 100% or more
    : percentage.gte(50)
      ? 'text-st-info' // Orange for 50% to 99%
      : 'text-st-error' // Red for less than 50%

  // Prepare values to display
  const quorumToShow = quorumAtSnapshot.eq(0) ? '-' : quorumAtSnapshot // Show '-' if quorum is 0
  const percentageToShow = quorumAtSnapshot.eq(0) ? '-' : percentage // Show '-' if percentage can't be calculated

  return (
    <>
      <p className={colorClass}>
        {formatNumberWithCommas(quorumVotes.round().toString())} (
        {formatNumberWithCommas(percentageToShow.toString())}%)
      </p>
      <p>Quorum: {formatNumberWithCommas(quorumToShow.toString())}</p>
    </>
  )
}
