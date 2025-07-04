import { Header } from '@/components/TypographyNew'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RootstockCollective — Create New Proposal',
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <div className="w-full lg:max-w-[1144px] mx-auto">
      <Header className="mb-10 leading-tight uppercase">New Proposal</Header>
      {children}
    </div>
  )
}
