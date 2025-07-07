import { Header } from '@/components/TypographyNew'
import { type Metadata } from 'next'
import { StepperProvider } from './stepper/StepperProvider'
import { ProposalStepper } from './stepper/ProposalStepper'

export const metadata: Metadata = {
  title: 'RootstockCollective — Create New Proposal',
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <StepperProvider>
      <div className="w-full lg:max-w-[1144px] mx-auto">
        <Header className="mb-4 leading-tight uppercase">New Proposal</Header>
        <ProposalStepper />
        {children}
      </div>
    </StepperProvider>
  )
}
