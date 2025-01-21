import { formatNumberWithCommas } from '@/lib/utils'

interface VotesColumnProps {
  forVotes: number
  abstainVotes: number
  quorumAtSnapshot: number
}

export const VotesColumn = ({ forVotes, abstainVotes, quorumAtSnapshot }: VotesColumnProps) => {
  // Calculate the total votes considered for the quorum
  const quorumVotes = forVotes + abstainVotes

  // Calculate the percentage relative to the quorumAtSnapshot
  // If quorumAtSnapshot is 0, percentage defaults to 0
  const percentage = quorumAtSnapshot === 0 ? 0 : Math.round((quorumVotes / quorumAtSnapshot) * 100)

  // Determine the color class based on the percentage
  const colorClass =
    percentage >= 100
      ? 'text-st-success' // Green for 100% or more
      : percentage >= 50
        ? 'text-st-info' // Orange for 50% to 99%
        : 'text-st-error' // Red for less than 50%

  // Prepare values to display
  const quorumToShow = quorumAtSnapshot === 0 ? '-' : quorumAtSnapshot // Show '-' if quorum is 0
  const percentageToShow = quorumAtSnapshot === 0 ? '-' : percentage // Show '-' if percentage can't be calculated

  return (
    <>
      <p className={colorClass}>
        {formatNumberWithCommas(Math.floor(quorumVotes))} ({formatNumberWithCommas(percentageToShow)}%)
      </p>
      <p>Quorum: {formatNumberWithCommas(quorumToShow)}</p>
    </>
  )
}
