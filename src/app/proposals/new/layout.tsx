import type { Metadata } from 'next'

import { PageTitle } from '@/components/PageBanner'

import { ProposalStepper } from '../components/stepper/ProposalStepper'
import { VotingPowerWrapper } from './components/VotingPowerWrapper'

export const metadata: Metadata = {
  title: 'RootstockCollective — Create New Proposal',
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <div className="w-full lg:max-w-[1144px] mx-auto mt-8 md:mt-0">
      <PageTitle className="mb-4">New Proposal</PageTitle>
      <VotingPowerWrapper>
        <ProposalStepper />
        {children}
      </VotingPowerWrapper>
    </div>
  )
}
