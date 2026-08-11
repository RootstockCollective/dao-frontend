import moment from 'moment'

import { GrantsIcon, HammerIcon } from '@/app/proposals/components/icons'
import { MilestoneIcon } from '@/app/proposals/components/MilestoneIcon'
import { type PendingProposal } from '@/app/proposals/hooks/usePendingProposals'
import { Milestones } from '@/app/proposals/shared/types'
import { SpinnerIcon } from '@/components/Icons'
import { Tooltip } from '@/components/Tooltip'
import { Paragraph, Span } from '@/components/Typography'
import { shortAddress } from '@/lib/utils'
import { PENDING_PROPOSAL_WAIT_MESSAGE, VERIFYING_PROPOSAL_WAIT_MESSAGE } from '@/shared/txMessages'
import { ProposalCategory } from '@/shared/types'

interface PendingProposalRowsProps {
  pendingProposals: PendingProposal[]
}

interface PendingProposalDesktopRowsProps extends PendingProposalRowsProps {
  gridTemplateColumns: string
}

const PendingProposalBadge = ({ label, compact = false }: { label: string; compact?: boolean }) => (
  <span
    className={`inline-flex shrink-0 items-center gap-2 rounded-full bg-primary text-bg-100 ${
      compact ? 'px-2 py-0.5' : 'px-3 py-1'
    }`}
  >
    <SpinnerIcon
      size={12}
      color="var(--color-bg-100)"
      className="shrink-0 animate-spin"
      aria-label="Proposal loading"
    />
    <Span variant="body-xs" className="uppercase tracking-[0.08em]" bold>
      {label}
    </Span>
  </span>
)

const PendingStatus = ({ label }: { label: string }) => (
  <div className="inline-flex h-[26px] w-full max-w-[68px] items-center justify-center rounded-full bg-bg-40 px-1 py-[3px]">
    <Paragraph className="whitespace-nowrap text-[clamp(10px,1.1vw,12px)]">{label}</Paragraph>
  </div>
)

const getPendingProposalCopy = (proposal: PendingProposal) =>
  proposal.stage === 'confirming'
    ? {
        badge: 'Verifying',
        status: 'Verifying',
        timing: 'Waiting for confirmation',
        tooltip: VERIFYING_PROPOSAL_WAIT_MESSAGE,
      }
    : {
        badge: 'Almost there',
        status: 'Syncing',
        timing: 'Live in a few minutes',
        tooltip: PENDING_PROPOSAL_WAIT_MESSAGE,
      }

const PendingCategoryIcon = ({ category }: { category: ProposalCategory }) => {
  switch (category) {
    case ProposalCategory.Grants:
      return <GrantsIcon aria-label={category} />
    case ProposalCategory.Milestone1:
      return <MilestoneIcon milestone={Milestones.MILESTONE_1} aria-label={category} />
    case ProposalCategory.Milestone2:
      return <MilestoneIcon milestone={Milestones.MILESTONE_2} aria-label={category} />
    case ProposalCategory.Milestone3:
      return <MilestoneIcon milestone={Milestones.MILESTONE_3} aria-label={category} />
    case ProposalCategory.Milestone4:
      return <MilestoneIcon milestone={Milestones.MILESTONE_4} aria-label={category} />
    case ProposalCategory.Milestone5:
      return <MilestoneIcon milestone={Milestones.MILESTONE_5} aria-label={category} />
    default:
      return <HammerIcon aria-label={category} />
  }
}

const SubmittedBy = ({ proposer }: Pick<PendingProposal, 'proposer'>) => (
  <div className="flex min-w-0 items-center gap-1">
    <Span variant="body-s" className="whitespace-nowrap">
      Submitted by you
    </Span>
    <Span variant="body-s" className="text-text-40" aria-hidden="true">
      ·
    </Span>
    <Span variant="body-s" className="truncate text-primary">
      {shortAddress(proposer, 4)}
    </Span>
  </div>
)

export function PendingProposalDesktopRows({
  pendingProposals,
  gridTemplateColumns,
}: PendingProposalDesktopRowsProps) {
  return pendingProposals.map(proposal => {
    const copy = getPendingProposalCopy(proposal)

    return (
      <Tooltip key={proposal.transactionHash} text={copy.tooltip} side="top">
        <div
          role="row"
          aria-disabled="true"
          tabIndex={0}
          className="grid cursor-wait gap-x-4 border-b border-b-bg-60 bg-primary/5 px-4 pt-6 pb-5 outline-none transition-colors hover:bg-primary/10 focus-visible:ring-1 focus-visible:ring-primary"
          style={{ gridTemplateColumns }}
          data-testid="PendingProposalRow"
        >
          <div
            role="cell"
            className="flex min-w-0 items-center gap-3 pb-[22px]"
            style={{ gridColumn: '1 / -1' }}
          >
            <PendingProposalBadge label={copy.badge} />
            <Paragraph className="break-all text-primary">{proposal.name}</Paragraph>
          </div>
          <div role="cell" className="flex min-w-0 items-center overflow-hidden">
            <SubmittedBy proposer={proposal.proposer} />
          </div>
          <div role="cell" className="flex items-center overflow-hidden">
            <Paragraph>{moment(proposal.submittedAt).format('MMM DD, YYYY')}</Paragraph>
          </div>
          <div role="cell" className="flex items-center overflow-hidden">
            <Paragraph className="text-primary">{copy.timing}</Paragraph>
          </div>
          <div role="cell" className="flex items-center overflow-hidden">
            <Paragraph className="text-text-40">—</Paragraph>
          </div>
          <div role="cell" className="flex items-center overflow-hidden">
            <Paragraph className="text-text-40">—</Paragraph>
          </div>
          <div role="cell" className="flex items-center overflow-hidden">
            <PendingCategoryIcon category={proposal.category} />
          </div>
          <div role="cell" className="flex items-center justify-center overflow-hidden">
            <PendingStatus label={copy.status} />
          </div>
        </div>
      </Tooltip>
    )
  })
}

export function PendingProposalMobileRows({ pendingProposals }: PendingProposalRowsProps) {
  return pendingProposals.map(proposal => {
    const copy = getPendingProposalCopy(proposal)

    return (
      <Tooltip key={proposal.transactionHash} text={copy.tooltip} side="top">
        <div
          role="row"
          aria-disabled="true"
          tabIndex={0}
          className="mb-5 cursor-wait border-b border-bg-60 bg-primary/5 px-2 pb-5 outline-none focus-visible:ring-1 focus-visible:ring-primary"
          data-testid="PendingProposalRow"
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <PendingProposalBadge label={copy.badge} compact />
            <Paragraph className="break-all text-primary">{proposal.name}</Paragraph>
          </div>
          <div className="flex items-center justify-between gap-3">
            <SubmittedBy proposer={proposal.proposer} />
            <PendingStatus label={copy.status} />
          </div>
          <div className="mt-2 flex items-center gap-2 text-primary">
            <PendingCategoryIcon category={proposal.category} />
            <Paragraph variant="body-s">{copy.timing}</Paragraph>
          </div>
        </div>
      </Tooltip>
    )
  })
}
