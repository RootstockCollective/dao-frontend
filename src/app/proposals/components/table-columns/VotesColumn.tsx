import { formatNumberWithCommas } from '@/lib/utils'
import Big from '@/lib/big'
import { PizzaChart } from '@/components/PizzaChart'

interface QuorumColumnProps {
  forVotes: Big
  abstainVotes: Big
  quorumAtSnapshot: Big
}

export const QuorumColumn = ({ forVotes, abstainVotes, quorumAtSnapshot }: QuorumColumnProps) => {
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
        {formatNumberWithCommas(quorumToShow)}&nbsp;|&nbsp;
        {formatNumberWithCommas(percentageToShow.toString())}%
      </p>
    </>
  )
}
interface VotesColumnProps {
  forVotes: number
  againstVotes: number
  abstainVotes: number
}
export const VotesColumn = ({ forVotes, againstVotes, abstainVotes }: VotesColumnProps) => (
  <div className="flex flex-wrap items-center justify-end gap-3">
    <p>{forVotes + againstVotes + abstainVotes}</p>
    <PizzaChart
      segments={[
        { name: 'For', value: forVotes },
        { name: 'Abstain', value: abstainVotes },
        { name: 'Against', value: againstVotes },
      ]}
    />
  </div>
)
