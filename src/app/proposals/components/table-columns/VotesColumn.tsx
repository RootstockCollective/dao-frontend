import { cn, formatNumberWithCommas } from '@/lib/utils'
import Big from '@/lib/big'
import { PizzaChart } from '@/components/PizzaChart'
import { Paragraph } from '@/components/TypographyNew'
import { ClassNameValue } from 'tailwind-merge'

interface QuorumColumnProps {
  quorumVotes: Big
  quorumAtSnapshot: Big
  className?: ClassNameValue
}

export const QuorumColumn = ({ quorumVotes, quorumAtSnapshot, className }: QuorumColumnProps) => {
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
      <Paragraph className={cn(colorClass, 'w-full text-center', className)}>
        {quorumAtSnapshot.eq(0) ? (
          '-'
        ) : (
          <>
            {formatNumberWithCommas(quorumAtSnapshot)}&nbsp;|&nbsp;
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
  className?: ClassNameValue
  textClassName?: ClassNameValue
  chartClassName?: ClassNameValue
}
export const VotesColumn = ({
  forVotes,
  againstVotes,
  abstainVotes,
  className,
  textClassName,
  chartClassName,
}: VotesColumnProps) => (
  <div className={cn('w-full flex flex-wrap items-center justify-end gap-x-3', className)}>
    <Paragraph className={cn(textClassName)}>{forVotes + againstVotes + abstainVotes}</Paragraph>
    <PizzaChart
      className={cn(chartClassName)}
      segments={[
        { name: 'For', value: forVotes },
        { name: 'Abstain', value: abstainVotes },
        { name: 'Against', value: againstVotes },
      ]}
    />
  </div>
)
