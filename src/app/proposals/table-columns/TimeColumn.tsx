import { Typography } from '@/components/Typography'
import moment from 'moment'
import { DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK } from '@/lib/constants'

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
  blocksUntilClosure: number
  proposalDeadline: number
  proposalBlockNumber: number
}

export function TimeColumn({ blocksUntilClosure, proposalDeadline, proposalBlockNumber }: TimeColumnProps) {
  const votingPeriod = proposalDeadline - proposalBlockNumber
  const ratio = blocksUntilClosure / votingPeriod
  const colorClass = getColorClass(ratio)
  const timeRemainingSec = blocksUntilClosure * DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK
  const timeRemainingMsg = blocksUntilClosure > 0 ? convertToTimeRemaining(timeRemainingSec) : '-'
  return (
    <Typography tagVariant="p" className={colorClass}>
      {timeRemainingMsg}
    </Typography>
  )
}
