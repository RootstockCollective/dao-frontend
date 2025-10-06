import { cn, formatNumberWithCommas } from '@/lib/utils'
import Big from '@/lib/big'
import { PizzaChart } from '@/components/PizzaChart'
import { Paragraph } from '@/components/Typography'
import { ClassNameValue } from 'tailwind-merge'

interface QuorumColumnProps {
  quorumVotes: Big
  quorumAtSnapshot: Big
  className?: ClassNameValue
  hideQuorumTarget?: boolean
}

export const QuorumColumn = ({
  quorumVotes,
  quorumAtSnapshot,
  className,
  hideQuorumTarget,
}: QuorumColumnProps) => {
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
    <Paragraph className={cn(colorClass, className)} data-testid="ProposalQuorumPercentage">
      {quorumAtSnapshot.eq(0) ? (
        '-'
      ) : (
        <>
          {!hideQuorumTarget && formatNumberWithCommas(quorumAtSnapshot) + ' | '}
          {formatNumberWithCommas(percentage)}%
        </>
      )}
    </Paragraph>
  )
}
interface VotesColumnProps {
  forVotes: number
  againstVotes: number
  abstainVotes: number
  className?: ClassNameValue
  textClassName?: ClassNameValue
  chartClassName?: ClassNameValue
  showChart?: boolean
}
export const VotesColumn = ({
  forVotes,
  againstVotes,
  abstainVotes,
  className,
  textClassName,
  chartClassName,
  showChart = true,
}: VotesColumnProps) => (
  <div className={cn('w-full flex flex-wrap items-center gap-x-3', className)} data-testid="ProposalVotes">
    <Paragraph className={cn(textClassName)} data-testid="ProposalVotesCount">
      {forVotes + againstVotes + abstainVotes}
    </Paragraph>
    {showChart && (
      <PizzaChart
        className={cn(chartClassName)}
        segments={[
          { name: 'For', value: forVotes },
          { name: 'Abstain', value: abstainVotes },
          { name: 'Against', value: againstVotes },
        ]}
        data-testid="ProposalVotesChart"
      />
    )}
  </div>
)
