import { Paragraph } from '@/components/Typography'
import { useMemo } from 'react'
import { Popover } from '@/components/Popover'
import { ComparativeProgressBar } from '@/components/ComparativeProgressBar/ComparativeProgressBar'

interface PopoverSentimentProps {
  againstVotes?: number
  forVotes?: number
  abstainVotes?: number
}
const PopoverSentiment = ({ forVotes = 0, againstVotes = 0, abstainVotes = 0 }: PopoverSentimentProps) => {
  return (
    <div className="text-black overflow-hidden">
      <Paragraph variant="semibold" className="text-[12px] font-bold">
        Votes for
      </Paragraph>
      <div className="flex flex-row">
        <Paragraph variant="semibold" className="text-[12px] w-1/2 text-st-success">
          For
        </Paragraph>
        <Paragraph variant="semibold" className="text-[12px] w-1/2">
          {forVotes}
        </Paragraph>
      </div>
      <div className="flex flex-row">
        <Paragraph variant="semibold" className="text-[12px] w-1/2 text-st-error">
          Against
        </Paragraph>
        <Paragraph variant="semibold" className="text-[12px] w-1/2">
          {againstVotes}
        </Paragraph>
      </div>
      <div className="flex flex-row">
        <Paragraph variant="semibold" className="text-[12px] w-1/2 text-st-info">
          Abstain
        </Paragraph>
        <Paragraph variant="semibold" className="text-[12px] w-1/2">
          {abstainVotes}
        </Paragraph>
      </div>
    </div>
  )
}

interface SentimentColumnProps {
  againstVotes?: number
  forVotes?: number
  abstainVotes?: number
  index?: number
}

export const SentimentColumn = ({
  againstVotes = 0,
  forVotes = 0,
  abstainVotes = 0,
  index = 0,
}: SentimentColumnProps) => {
  const sentimentValues = useMemo(() => {
    return [
      { value: Number(forVotes), color: 'var(--st-success)' },
      { value: Number(againstVotes), color: 'var(--st-error)' },
      { value: Number(abstainVotes), color: 'var(--st-info)' },
    ]
  }, [abstainVotes, againstVotes, forVotes])

  const position = index === 0 ? 'bottom' : 'top'
  return (
    <Popover
      content={
        <PopoverSentiment againstVotes={againstVotes} forVotes={forVotes} abstainVotes={abstainVotes} />
      }
      trigger="hover"
      background="light"
      position={position}
      size="small"
      hasCaret={true}
    >
      <ComparativeProgressBar values={sentimentValues} />
    </Popover>
  )
}
