import { Paragraph } from '@/components/TypographyNew'
import moment from 'moment'
import { DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK } from '@/lib/constants'
import Big from '@/lib/big'
import { cn } from '@/lib/utils'

const convertToTimeRemaining = (seconds: number) => {
  const duration = moment.duration(seconds, 'seconds')
  const days = duration.days()
  const hours = duration.hours()
  const minutes = duration.minutes()
  const remainingSeconds = duration.seconds()

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

interface TimeColumnProps {
  blocksUntilClosure: Big
  proposalDeadline: Big
  proposalBlockNumber: string
}

export function TimeColumn({ blocksUntilClosure, proposalDeadline, proposalBlockNumber }: TimeColumnProps) {
  const votingPeriod = proposalDeadline.minus(Number(proposalBlockNumber))
  const ratio = votingPeriod.eq(0) ? Big(0) : blocksUntilClosure.div(votingPeriod)

  const colorClass = getColorClass(ratio.toNumber())

  const timeRemainingSec = blocksUntilClosure.mul(DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK)

  const timeRemainingMsg = blocksUntilClosure.gt(0)
    ? convertToTimeRemaining(timeRemainingSec.toNumber())
    : '-'
  return <Paragraph className={cn(colorClass, 'w-full text-center')}>{timeRemainingMsg}</Paragraph>
}
