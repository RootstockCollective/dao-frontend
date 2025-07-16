import { Header } from '@/components/TypographyNew'
import { type Metadata } from 'next'
import { ProposalStepper } from '../components/stepper/ProposalStepper'

export const metadata: Metadata = {
  title: 'RootstockCollective — Create New Proposal',
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <div className="w-full lg:max-w-[1144px] mx-auto">
      <Header className="mb-4 leading-tight uppercase">New Proposal</Header>
      <ProposalStepper />
      {children}
    </div>
  )
}
