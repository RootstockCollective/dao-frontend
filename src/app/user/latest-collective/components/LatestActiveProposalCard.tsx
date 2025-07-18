import { ButtonAction } from '@/app/proposals/components/vote-details'
import { Proposal } from '@/app/proposals/shared/types'
import { Paragraph, Span } from '@/components/TypographyNew'
import Link from 'next/link'
import { ClassNameValue } from 'tailwind-merge'
import { CreatorRowComponent } from './CreatorRowComponent'
import { TimeColumn } from '@/app/proposals/components/table-columns/TimeColumn'
import { cn } from '@/lib/utils'
import { QuorumColumn, VotesColumn } from '@/app/proposals/components/table-columns/VotesColumn'
import { VotingPowerWithActionComponent } from '@/app/proposals/components/voting-power-with-action'

interface LatestActiveProposalCardProps {
  votingPower: bigint
  proposal: Proposal
  buttonAction: ButtonAction
  className?: ClassNameValue
}

const columnStyle: ClassNameValue = 'flex flex-col justify-start items-start'

export const LatestActiveProposalCard = ({
  proposal,
  votingPower,
  buttonAction,
  className,
}: LatestActiveProposalCardProps) => {
  const {
    proposalId,
    name,
    proposer,
    Starts,
    blocksUntilClosure,
    proposalDeadline,
    blockNumber,
    votes: { forVotes, abstainVotes, againstVotes },
    category,
    quorumAtSnapshot,
  } = proposal
  return (
    <div className={cn('flex flex-row bg-bg-60 p-6 pr-16', className)}>
      <div className="flex flex-col flex-1">
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
            <TimeColumn
              className="w-auto mt-2"
              blocksUntilClosure={blocksUntilClosure}
              proposalDeadline={proposalDeadline}
              proposalBlockNumber={blockNumber}
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
      <VotingPowerWithActionComponent
        className="flex-shrink-0 self-start"
        votingPower={votingPower}
        buttonAction={buttonAction}
      />
    </div>
  )
}
