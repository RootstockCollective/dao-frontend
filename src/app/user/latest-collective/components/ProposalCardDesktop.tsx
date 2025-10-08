import { QuorumColumn, VotesColumn } from '@/app/proposals/components/table-columns/VotesColumn'
import { Proposal } from '@/app/proposals/shared/types'
import { Countdown } from '@/components/Countdown'
import { Paragraph, Span } from '@/components/Typography'
import Big from '@/lib/big'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { CreatorRowComponent } from './CreatorRowComponent'
import { ClassNameValue } from 'tailwind-merge'

const columnStyle: ClassNameValue = 'flex flex-col justify-start items-start'

interface Props {
  proposal: Proposal
}

export const ProposalCardDesktop = ({ proposal }: Props) => {
  const {
    proposalId,
    name,
    proposer,
    Starts,
    proposalDeadline,
    blockNumber,
    votes: { forVotes, abstainVotes, againstVotes },
    category,
    quorumAtSnapshot,
  } = proposal
  return (
    <div className="flex flex-col flex-1 min-w-0">
      <Link
        className="text-primary group-hover:underline group-hover:text-bg-100 group-hover:decoration-bg-40"
        href={`/proposals/${proposalId}`}
      >
        <Paragraph className="w-full truncate">{name}</Paragraph>
      </Link>
      <CreatorRowComponent proposer={proposer} Starts={Starts} category={category} />
      {/** vote ending, quorum and votes columns*/}
      <div className="flex flex-row mt-6 justify-start">
        {/** vote ending column */}
        <div className={columnStyle}>
          <Span variant="tag" className="text-bg-0">
            Vote ending in
          </Span>
          <Countdown
            className="w-auto mt-2"
            end={proposalDeadline}
            timeSource="blocks"
            referenceStart={Big(blockNumber)}
            colorDirection="normal"
          />
        </div>
        {/** quorum column */}
        <div className={cn(columnStyle, 'ml-10')}>
          <Span variant="tag" className="text-bg-0">
            Quorum needed | reached
          </Span>
          <QuorumColumn
            className="w-auto mt-2 text-left"
            quorumVotes={forVotes.add(abstainVotes)}
            quorumAtSnapshot={quorumAtSnapshot}
          />
        </div>
        {/** votes column */}
        <div className={cn(columnStyle, 'ml-10')}>
          <Span variant="tag" className="text-bg-0">
            Votes
          </Span>
          <VotesColumn
            className="w-auto items-start"
            textClassName="mt-2"
            chartClassName="mt-1"
            forVotes={forVotes.toNumber()}
            againstVotes={againstVotes.toNumber()}
            abstainVotes={abstainVotes.toNumber()}
          />
        </div>
      </div>
    </div>
  )
}
