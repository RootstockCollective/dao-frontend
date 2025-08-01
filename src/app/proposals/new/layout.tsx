'use client'

import { Header } from '@/components/TypographyNew'
import { ProposalStepper } from '../components/stepper/ProposalStepper'
import { useVotingPowerRedirect } from '../hooks/useVotingPowerRedirect'
import { VotingPowerLoading } from '@/components/LoadingSpinner'

export default function Layout({ children }: React.PropsWithChildren) {
  const { isVotingPowerLoading, canCreateProposal } = useVotingPowerRedirect()

  return (
    <div className="w-full lg:max-w-[1144px] mx-auto">
      <Header className="mb-4 leading-tight uppercase">New Proposal</Header>
      {isVotingPowerLoading || !canCreateProposal ? (
        <VotingPowerLoading />
      ) : (
        <>
          <ProposalStepper />
          {children}
        </>
      )}
    </div>
  )
}
