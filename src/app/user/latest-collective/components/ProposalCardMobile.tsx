import { Category } from '@/app/proposals/components/category'
import { ProposerColumn } from '@/app/proposals/components/table-columns/ProposalNameColumn'
import { QuorumColumn, VotesColumn } from '@/app/proposals/components/table-columns/VotesColumn'
import { Proposal } from '@/app/proposals/shared/types'
import { Countdown } from '@/components/Countdown'
import { Expandable, ExpandableContent, ExpandableHeader } from '@/components/Expandable'
import { SmallLineSeparator } from '@/components/Separators/SmallLineSeparator'
import { Status } from '@/components/Status'
import { Paragraph, Span } from '@/components/Typography'
import Big from '@/lib/big'
import { useState } from 'react'

interface Props {
  proposal: Proposal
}

export const ProposalCardMobile = ({ proposal }: Props) => {
  const {
    name,
    proposer,
    Starts,
    proposalDeadline,
    blockNumber,
    votes: { forVotes, abstainVotes, againstVotes },
    category,
    quorumAtSnapshot,
    proposalState,
  } = proposal
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <Expandable onToggleExpanded={setIsExpanded}>
      <ExpandableHeader triggerColor="var(--color-bg-0)">
        <Paragraph className="text-primary">{name}</Paragraph>
      </ExpandableHeader>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <ProposerColumn by={proposer} />
          <SmallLineSeparator />
          <div>
            {isExpanded ? (
              <Category category={category} />
            ) : (
              <Countdown
                end={proposalDeadline}
                timeSource="blocks"
                referenceStart={Big(blockNumber)}
                colorDirection="normal"
              />
            )}
          </div>
        </div>
        <Status proposalState={proposalState} className="w-full flex justify-center" />
      </div>
      <ExpandableContent>
        <div className="flex flex-row">
          <div className="flex flex-2 flex-col gap-2">
            <div>
              <Span variant="body-xs" className="text-text-40">
                Date
              </Span>
              <Paragraph>{Starts.format('MMM DD, YYYY')}</Paragraph>
            </div>
            <div>
              <Span variant="body-xs" className="text-text-40">
                Quorum - needed | reached
              </Span>
              <QuorumColumn
                className="w-auto mt-2 text-left"
                quorumVotes={forVotes.add(abstainVotes)}
                quorumAtSnapshot={quorumAtSnapshot}
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div>
              <Span variant="body-xs" className="text-text-40">
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
            <div>
              <Span variant="body-xs" className="text-text-40">
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
      </ExpandableContent>
    </Expandable>
  )
}
