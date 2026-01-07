import { ButtonAction } from '@/app/proposals/components/vote-details'
import { VotingPowerWithActionComponent } from '@/app/proposals/components/voting-power-with-action'
import { Proposal } from '@/app/proposals/shared/types'
import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { ClassNameValue } from 'tailwind-merge'
import { ProposalCardDesktop } from './ProposalCardDesktop'
import { ProposalCardMobile } from './ProposalCardMobile'

interface LatestActiveProposalCardProps {
  votingPower: bigint
  proposal: Proposal
  buttonAction: ButtonAction
  className?: ClassNameValue
}

export const LatestActiveProposalCard = ({
  proposal,
  votingPower,
  buttonAction,
  className,
}: LatestActiveProposalCardProps) => {
  const isDesktop = useIsDesktop()

  return (
    <div className={cn('flex flex-col lg:flex-row md:bg-bg-60 md:p-6 gap-6 md:gap-2', className)}>
      {isDesktop ? <ProposalCardDesktop proposal={proposal} /> : <ProposalCardMobile proposal={proposal} />}
      <VotingPowerWithActionComponent
        className="flex-shrink-0 self-start"
        votingPower={votingPower}
        buttonAction={buttonAction}
      />
    </div>
  )
}
