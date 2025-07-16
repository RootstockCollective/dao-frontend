import { CategoryColumn } from '@/app/proposals/components/table-columns/CategoryColumn'
import { TimeColumn } from '@/app/proposals/components/table-columns/TimeColumn'
import { QuorumColumn, VotesColumn } from '@/app/proposals/components/table-columns/VotesColumn'
import { ButtonAction } from '@/app/proposals/components/vote-details'
import { VotingPowerWithActionComponent } from '@/app/proposals/components/voting-power-with-action'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { Proposal } from '@/app/proposals/shared/types'
import { CopyButton } from '@/components/CopyButton'
import { SmallLineSeparator } from '@/components/Separators/SmallLineSeparator'
import { Tooltip } from '@/components/Tooltip'
import { Header, Paragraph, Span } from '@/components/TypographyNew'
import { cn, shortAddress } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ClassNameValue } from 'tailwind-merge'

interface LatestActiveProposalCardProps {
  votingPower: bigint
  proposal: Proposal
  buttonAction: ButtonAction
  className?: ClassNameValue
}

const columnStyle: ClassNameValue = 'flex flex-col justify-start items-start'

const LatestActiveProposalCard = ({
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
        {/** who(address or rns), date and category icon*/}
        <div className="flex flex-row mt-2 items-center">
          <Tooltip text="Copy address">
            <span className="font-rootstock-sans">
              <CopyButton icon={null} className="inline" copyText={proposer}>
                <span className="text-primary">by</span>&nbsp;
                <span>{shortAddress(proposer)}</span>
              </CopyButton>
            </span>
          </Tooltip>
          <SmallLineSeparator />
          <Paragraph>{Starts.format('MMM DD, YYYY')}</Paragraph>
          <SmallLineSeparator />
          <CategoryColumn category={category} className="w-auto" />
        </div>
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

interface LatestCollectiveSectionProps {
  proposal?: Proposal
}

export const LatestCollectiveSection = ({ proposal }: LatestCollectiveSectionProps) => {
  const router = useRouter()

  const { votingPowerRaw } = useVotingPower()
  const buttonAction: ButtonAction = {
    actionName: 'View proposal',
    onButtonClick: () => {
      if (proposal) {
        router.push(`/proposals/${proposal.proposalId}`)
      }
    },
  }

  return (
    <div className="bg-bg-80 p-6">
      <Header variant="h3">THE LATEST IN THE COLLECTIVE</Header>
      <Header variant="h4" className="mt-10">
        PROPOSALS
      </Header>
      {proposal ? (
        <LatestActiveProposalCard
          className="mt-4"
          proposal={proposal}
          /**TODO: when votingPower returned as BigInt consume as is */
          votingPower={votingPowerRaw ?? BigInt(0)}
          buttonAction={buttonAction}
        />
      ) : null}
    </div>
  )
}
