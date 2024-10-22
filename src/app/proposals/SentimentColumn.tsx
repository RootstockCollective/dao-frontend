import { Paragraph } from '@/components/Typography'
import { useProposalContext } from '@/app/proposals/ProposalsContext'
import { useMemo } from 'react'
import { Popover } from '@/components/Popover'
import { ComparativeProgressBar } from '@/components/ComparativeProgressBar/ComparativeProgressBar'

const PopoverSentiment = ({ votes }: { votes: string[] }) => {
  const [againstVotes, forVotes, abstainVotes] = votes
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
          {Math.ceil(Number(forVotes))}
        </Paragraph>
      </div>
      <div className="flex flex-row">
        <Paragraph variant="semibold" className="text-[12px] w-1/2 text-st-error">
          Against
        </Paragraph>
        <Paragraph variant="semibold" className="text-[12px] w-1/2">
          {Math.ceil(Number(againstVotes))}
        </Paragraph>
      </div>
      <div className="flex flex-row">
        <Paragraph variant="semibold" className="text-[12px] w-1/2 text-st-info">
          Abstain
        </Paragraph>
        <Paragraph variant="semibold" className="text-[12px] w-1/2">
          {Math.ceil(Number(abstainVotes))}
        </Paragraph>
      </div>
    </div>
  )
}

export const SentimentColumn = () => {
  const { proposalVotes: data, index } = useProposalContext()

  const sentimentValues = useMemo(() => {
    const [againstVotes, forVotes, abstainVotes] = data
    return [
      { value: Number(forVotes), color: 'var(--st-success)' },
      { value: Number(againstVotes), color: 'var(--st-error)' },
      { value: Number(abstainVotes), color: 'var(--st-info)' },
    ]
  }, [data])

  const position = index === 0 ? 'bottom' : 'top'
  return (
    <Popover
      content={<PopoverSentiment votes={data} />}
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
