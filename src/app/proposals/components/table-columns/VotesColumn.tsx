import { formatNumberWithCommas } from '@/lib/utils'
import Big from '@/lib/big'
import { PizzaChart } from '@/components/PizzaChart'
import { Paragraph } from '@/components/TypographyNew'

interface QuorumColumnProps {
  quorumVotes: Big
  quorumAtSnapshot: Big
}

export const QuorumColumn = ({ quorumVotes, quorumAtSnapshot }: QuorumColumnProps) => {
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

  return (
    <>
      <Paragraph className={colorClass}>
        {quorumAtSnapshot.eq(0) ? (
          '-'
        ) : (
          <>
            {formatNumberWithCommas(quorumVotes)}&nbsp;|&nbsp;
            {formatNumberWithCommas(percentage)}%
          </>
        )}
      </Paragraph>
    </>
  )
}
interface VotesColumnProps {
  forVotes: number
  againstVotes: number
  abstainVotes: number
}
export const VotesColumn = ({ forVotes, againstVotes, abstainVotes }: VotesColumnProps) => (
  <div className="w-full flex flex-wrap items-center justify-end gap-x-3">
    <Paragraph>{forVotes + againstVotes + abstainVotes}</Paragraph>
    <PizzaChart
      segments={[
        { name: 'For', value: forVotes },
        { name: 'Abstain', value: abstainVotes },
        { name: 'Against', value: againstVotes },
      ]}
    />
  </div>
)
