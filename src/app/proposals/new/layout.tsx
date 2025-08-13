import { Header } from '@/components/Typography'
import { type Metadata } from 'next'
import { ProposalStepper } from '../components/stepper/ProposalStepper'
import { VotingPowerWrapper } from './components/VotingPowerWrapper'

export const metadata: Metadata = {
  title: 'RootstockCollective — Create New Proposal',
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <div className="w-full lg:max-w-[1144px] mx-auto">
      <Header className="mb-4 leading-tight uppercase">New Proposal</Header>
      <VotingPowerWrapper>
        <ProposalStepper />
        {children}
      </VotingPowerWrapper>
    </div>
  )
}
