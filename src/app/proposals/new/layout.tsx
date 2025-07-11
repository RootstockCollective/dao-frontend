import { Header } from '@/components/TypographyNew'
import { type Metadata } from 'next'
import { StepperProvider } from '../components/stepper/StepperProvider'
import { ProposalStepper } from '../components/stepper/ProposalStepper'
import { ReviewProposalProvider } from './context/ReviewProposalContext'

export const metadata: Metadata = {
  title: 'RootstockCollective — Create New Proposal',
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <StepperProvider>
      <ReviewProposalProvider>
        <div className="w-full lg:max-w-[1144px] mx-auto">
          <Header className="mb-4 leading-tight uppercase">New Proposal</Header>
          <ProposalStepper />
          {children}
        </div>
      </ReviewProposalProvider>
    </StepperProvider>
  )
}
